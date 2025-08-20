import { Resend } from 'resend'
import { prisma } from './prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailData {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export async function sendEmail({ to, subject, template, data }: EmailData) {
  try {
    // Get email template from database
    const emailTemplate = await prisma.emailTemplate.findUnique({
      where: { name: template, isActive: true },
    })

    if (!emailTemplate) {
      console.error(`Email template '${template}' not found`)
      return false
    }

    // Replace variables in template
    let htmlContent = emailTemplate.body
    let emailSubject = emailTemplate.subject

    // Replace placeholders with actual data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value))
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), String(value))
    })

    // Send email
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@jobportal.com',
      to,
      subject: emailSubject,
      html: htmlContent,
    })

    console.log('Email sent successfully:', result)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Send interview confirmation email
export async function sendInterviewConfirmation({
  candidateEmail,
  candidateName,
  jobTitle,
  interviewDate,
  interviewTime,
  interviewType,
  meetingLink,
}: {
  candidateEmail: string
  candidateName: string
  jobTitle: string
  interviewDate: string
  interviewTime: string
  interviewType: string
  meetingLink?: string
}) {
  return sendEmail({
    to: candidateEmail,
    subject: `Interview Confirmation - ${jobTitle}`,
    template: 'interview-confirmation',
    data: {
      candidateName,
      jobTitle,
      interviewDate,
      interviewTime,
      interviewType,
      meetingLink: meetingLink || 'Details will be shared separately',
    },
  })
}

// Send interview reminder email
export async function sendInterviewReminder({
  candidateEmail,
  candidateName,
  jobTitle,
  interviewDate,
  interviewTime,
  meetingLink,
}: {
  candidateEmail: string
  candidateName: string
  jobTitle: string
  interviewDate: string
  interviewTime: string
  meetingLink?: string
}) {
  return sendEmail({
    to: candidateEmail,
    subject: `Interview Reminder - ${jobTitle} Tomorrow`,
    template: 'interview-reminder',
    data: {
      candidateName,
      jobTitle,
      interviewDate,
      interviewTime,
      meetingLink: meetingLink || 'Details will be shared separately',
    },
  })
}

// Send bulk emails for job alerts
export async function sendJobAlerts(candidates: Array<{ email: string; name: string }>, jobData: any) {
  const promises = candidates.map(candidate =>
    sendEmail({
      to: candidate.email,
      subject: `New Job Alert - ${jobData.title}`,
      template: 'job-alert',
      data: {
        candidateName: candidate.name,
        jobTitle: jobData.title,
        companyName: jobData.company.name,
        location: jobData.location,
        jobUrl: `${process.env.NEXTAUTH_URL}/jobs/${jobData.id}`,
      },
    })
  )

  const results = await Promise.allSettled(promises)
  const successful = results.filter(result => result.status === 'fulfilled').length
  const failed = results.filter(result => result.status === 'rejected').length

  console.log(`Job alerts sent: ${successful} successful, ${failed} failed`)
  return { successful, failed }
}