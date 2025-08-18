import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}

export const emailTemplates = {
  jobAlert: (jobTitle: string, companyName: string, jobUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Job Alert!</h2>
      <p>A new job matching your preferences has been posted:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${jobTitle}</h3>
        <p><strong>Company:</strong> ${companyName}</p>
        <a href="${jobUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          View Job
        </a>
      </div>
    </div>
  `,
  
  applicationUpdate: (jobTitle: string, status: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Application Status Update</h2>
      <p>Your application status has been updated:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${jobTitle}</h3>
        <p><strong>Status:</strong> <span style="color: #007bff; font-weight: bold;">${status}</span></p>
      </div>
    </div>
  `,
}