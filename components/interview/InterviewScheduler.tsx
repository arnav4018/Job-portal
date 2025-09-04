'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Mail, 
  MessageSquare,
  Phone,
  Video,
  MapPin,
  Plus,
  Check,
  X,
  Bell,
  Send,
  Eye,
  Edit,
  Trash2,
  Filter
} from 'lucide-react'
import { format, addDays, addHours, isToday, isTomorrow, isThisWeek } from 'date-fns'

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  isBooked: boolean
  bookedBy?: string
  candidateName?: string
  jobTitle?: string
  notificationSent: boolean
  whatsappSent: boolean
  emailSent: boolean
}

interface Interview {
  id: string
  candidateId: string
  candidateName: string
  jobTitle: string
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL'
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  scheduledAt: Date
  duration: number
  location?: string
  notes?: string
  confirmationSent: boolean
  reminderSent: boolean
}

const interviewTypes = [
  { value: 'PHONE', label: 'Phone Call', icon: Phone, color: 'bg-blue-500' },
  { value: 'VIDEO', label: 'Video Call', icon: Video, color: 'bg-green-500' },
  { value: 'IN_PERSON', label: 'In Person', icon: MapPin, color: 'bg-purple-500' },
  { value: 'TECHNICAL', label: 'Technical Round', icon: Users, color: 'bg-orange-500' }
]

const notificationMethods = [
  { id: 'email', label: 'Email', icon: Mail, enabled: true },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, enabled: true },
  { id: 'sms', label: 'SMS', icon: Phone, enabled: false }
]

export default function InterviewScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [showCreateSlot, setShowCreateSlot] = useState(false)
  const [showScheduleInterview, setShowScheduleInterview] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [newSlotStartTime, setNewSlotStartTime] = useState('')
  const [newSlotEndTime, setNewSlotEndTime] = useState('')
  const [candidateId, setCandidateId] = useState('')
  const [jobId, setJobId] = useState('')
  const [interviewType, setInterviewType] = useState<string>('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadTimeSlots()
    loadInterviews()
  }, [selectedDate])

  const loadTimeSlots = async () => {
    // Mock data - replace with actual API call
    const mockSlots: TimeSlot[] = [
      {
        id: '1',
        date: selectedDate,
        startTime: '09:00',
        endTime: '10:00',
        isBooked: false,
        notificationSent: false,
        whatsappSent: false,
        emailSent: false
      },
      {
        id: '2',
        date: selectedDate,
        startTime: '10:30',
        endTime: '11:30',
        isBooked: true,
        bookedBy: 'candidate123',
        candidateName: 'John Doe',
        jobTitle: 'Senior Developer',
        notificationSent: true,
        whatsappSent: true,
        emailSent: true
      },
      {
        id: '3',
        date: selectedDate,
        startTime: '14:00',
        endTime: '15:00',
        isBooked: false,
        notificationSent: false,
        whatsappSent: false,
        emailSent: false
      }
    ]
    setTimeSlots(mockSlots)
  }

  const loadInterviews = async () => {
    // Mock data - replace with actual API call
    const mockInterviews: Interview[] = [
      {
        id: '1',
        candidateId: 'candidate123',
        candidateName: 'John Doe',
        jobTitle: 'Senior Developer',
        type: 'VIDEO',
        status: 'SCHEDULED',
        scheduledAt: new Date(selectedDate.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
        duration: 60,
        location: 'https://meet.google.com/abc-def-ghi',
        confirmationSent: true,
        reminderSent: false
      },
      {
        id: '2',
        candidateId: 'candidate456',
        candidateName: 'Jane Smith',
        jobTitle: 'Frontend Engineer',
        type: 'TECHNICAL',
        status: 'CONFIRMED',
        scheduledAt: addDays(selectedDate, 1),
        duration: 90,
        confirmationSent: true,
        reminderSent: true
      }
    ]
    setInterviews(mockInterviews)
  }

  const createTimeSlot = async () => {
    if (!newSlotStartTime || !newSlotEndTime) return

    try {
      setIsLoading(true)
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        date: selectedDate,
        startTime: newSlotStartTime,
        endTime: newSlotEndTime,
        isBooked: false,
        notificationSent: false,
        whatsappSent: false,
        emailSent: false
      }

      setTimeSlots([...timeSlots, newSlot])
      setShowCreateSlot(false)
      setNewSlotStartTime('')
      setNewSlotEndTime('')
    } catch (error) {
      console.error('Error creating time slot:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scheduleInterview = async () => {
    if (!selectedSlot || !candidateId || !jobId || !interviewType) return

    try {
      setIsLoading(true)
      
      // Update time slot to booked
      const updatedSlots = timeSlots.map(slot => 
        slot.id === selectedSlot.id 
          ? { ...slot, isBooked: true, bookedBy: candidateId }
          : slot
      )
      setTimeSlots(updatedSlots)

      // Create new interview
      const newInterview: Interview = {
        id: Date.now().toString(),
        candidateId,
        candidateName: 'Candidate Name', // This would come from API
        jobTitle: 'Job Title', // This would come from API
        type: interviewType as Interview['type'],
        status: 'SCHEDULED',
        scheduledAt: new Date(selectedSlot.date.getTime() + 
          parseInt(selectedSlot.startTime.split(':')[0]) * 60 * 60 * 1000 +
          parseInt(selectedSlot.startTime.split(':')[1]) * 60 * 1000
        ),
        duration: 60,
        location,
        notes,
        confirmationSent: false,
        reminderSent: false
      }

      setInterviews([...interviews, newInterview])
      setShowScheduleInterview(false)
      setSelectedSlot(null)
      
      // Reset form
      setCandidateId('')
      setJobId('')
      setInterviewType('')
      setLocation('')
      setNotes('')

    } catch (error) {
      console.error('Error scheduling interview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendNotifications = async (interviewId: string, methods: string[]) => {
    try {
      setIsLoading(true)
      
      // Mock API call to send notifications
      const response = await fetch('/api/interviews/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          methods,
          message: 'Interview reminder and details'
        })
      })

      if (response.ok) {
        // Update interview status
        setInterviews(interviews.map(interview => 
          interview.id === interviewId
            ? { ...interview, confirmationSent: true, reminderSent: true }
            : interview
        ))
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Interview['status']) => {
    const statusConfig = {
      'SCHEDULED': { color: 'bg-blue-500', text: 'Scheduled' },
      'CONFIRMED': { color: 'bg-green-500', text: 'Confirmed' },
      'IN_PROGRESS': { color: 'bg-orange-500', text: 'In Progress' },
      'COMPLETED': { color: 'bg-gray-500', text: 'Completed' },
      'CANCELLED': { color: 'bg-red-500', text: 'Cancelled' },
      'NO_SHOW': { color: 'bg-red-400', text: 'No Show' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isThisWeek(date)) return format(date, 'EEEE')
    return format(date, 'MMM dd')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Scheduler</h1>
            <p className="text-sm text-gray-600">Manage interview time slots and scheduling</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowCreateSlot(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Time Slot
          </Button>
          <Button 
            onClick={() => setShowScheduleInterview(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Time Slots for Selected Date */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Time Slots - {getDateLabel(selectedDate)}
                </CardTitle>
                <Badge variant="outline">
                  {timeSlots.filter(slot => !slot.isBooked).length} Available
                </Badge>
              </div>
              <CardDescription>
                Available interview time slots for {format(selectedDate, 'MMMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeSlots.map((slot) => (
                  <div 
                    key={slot.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      slot.isBooked 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-green-200 bg-green-50 hover:border-green-400'
                    }`}
                    onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      {slot.isBooked ? (
                        <Badge variant="destructive" className="text-xs">
                          Booked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Available
                        </Badge>
                      )}
                    </div>

                    {slot.isBooked && slot.candidateName && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{slot.candidateName}</p>
                        <p>{slot.jobTitle}</p>
                      </div>
                    )}

                    {slot.isBooked && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${
                          slot.emailSent ? 'bg-green-500' : 'bg-gray-300'
                        }`} title="Email sent" />
                        <div className={`w-2 h-2 rounded-full ${
                          slot.whatsappSent ? 'bg-green-500' : 'bg-gray-300'
                        }`} title="WhatsApp sent" />
                        <div className={`w-2 h-2 rounded-full ${
                          slot.notificationSent ? 'bg-green-500' : 'bg-gray-300'
                        }`} title="Notification sent" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {timeSlots.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No time slots</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create time slots for this date to start scheduling interviews.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Upcoming Interviews</span>
              </CardTitle>
              <CardDescription>
                Scheduled interviews for the next few days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">{interview.candidateName}</span>
                          </div>
                          {getStatusBadge(interview.status)}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{interview.jobTitle}</p>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{format(interview.scheduledAt, 'MMM dd, yyyy')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{format(interview.scheduledAt, 'HH:mm')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              {interviewTypes.find(t => t.value === interview.type)?.icon && (
                                <span className="w-3 h-3">
                                  {React.createElement(interviewTypes.find(t => t.value === interview.type)!.icon, { className: "w-3 h-3" })}
                                </span>
                              )}
                              <span>{interviewTypes.find(t => t.value === interview.type)?.label}</span>
                            </span>
                          </div>
                          {interview.location && (
                            <p className="text-blue-600 text-xs">{interview.location}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col space-y-1">
                          <div className={`w-2 h-2 rounded-full ${
                            interview.confirmationSent ? 'bg-green-500' : 'bg-gray-300'
                          }`} title="Confirmation sent" />
                          <div className={`w-2 h-2 rounded-full ${
                            interview.reminderSent ? 'bg-green-500' : 'bg-gray-300'
                          }`} title="Reminder sent" />
                        </div>

                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendNotifications(interview.id, ['email', 'whatsapp'])}
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Time Slot Dialog */}
      <Dialog open={showCreateSlot} onOpenChange={setShowCreateSlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Time Slot</DialogTitle>
            <DialogDescription>
              Create a new interview time slot for {format(selectedDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <Input
                  type="time"
                  value={newSlotStartTime}
                  onChange={(e) => setNewSlotStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <Input
                  type="time"
                  value={newSlotEndTime}
                  onChange={(e) => setNewSlotEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateSlot(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createTimeSlot}
                disabled={!newSlotStartTime || !newSlotEndTime || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Slot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleInterview} onOpenChange={setShowScheduleInterview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule a new interview for an available time slot
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Candidate ID</label>
                <Input
                  placeholder="Enter candidate ID"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Job ID</label>
                <Input
                  placeholder="Enter job ID"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interview Type</label>
              <Select onValueChange={setInterviewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  {interviewTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location/Meeting Link</label>
              <Input
                placeholder="Meeting room or video call link"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Input
                placeholder="Additional notes for the interview"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Notification Methods</h4>
              <div className="flex space-x-4">
                {notificationMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={method.id}
                      defaultChecked={method.enabled}
                      className="rounded"
                    />
                    <label htmlFor={method.id} className="flex items-center space-x-1 text-sm">
                      <method.icon className="w-3 h-3" />
                      <span>{method.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleInterview(false)}>
                Cancel
              </Button>
              <Button 
                onClick={scheduleInterview}
                disabled={!candidateId || !jobId || !interviewType || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
