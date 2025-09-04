'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Search,
  Filter,
  Users,
  Star,
  Archive,
  Trash2,
  Pin,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Zap,
  ExternalLink,
  Download,
  Image as ImageIcon,
  File
} from 'lucide-react'
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'system'
  status: 'sending' | 'sent' | 'delivered' | 'read'
  replyTo?: string
  attachments?: Attachment[]
}

interface Attachment {
  id: string
  name: string
  type: 'image' | 'document' | 'video'
  url: string
  size: number
}

interface Conversation {
  id: string
  type: 'direct' | 'group' | 'whatsapp'
  name: string
  avatar?: string
  participants: Participant[]
  lastMessage?: Message
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  isActive: boolean
  tags: string[]
}

interface Participant {
  id: string
  name: string
  avatar?: string
  role: 'candidate' | 'recruiter' | 'company'
  isOnline: boolean
  lastSeen?: Date
}

interface WhatsAppTemplate {
  id: string
  name: string
  category: 'interview' | 'offer' | 'reminder' | 'general'
  content: string
  variables: string[]
}

const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: '1',
    name: 'Interview Reminder',
    category: 'interview',
    content: 'Hi {{name}}, this is a reminder about your interview for {{position}} tomorrow at {{time}}. Please join us at {{location}}. Good luck!',
    variables: ['name', 'position', 'time', 'location']
  },
  {
    id: '2',
    name: 'Offer Letter',
    category: 'offer',
    content: 'Congratulations {{name}}! We are pleased to offer you the position of {{position}} at {{company}}. Please check your email for the offer letter.',
    variables: ['name', 'position', 'company']
  },
  {
    id: '3',
    name: 'Document Request',
    category: 'general',
    content: 'Hi {{name}}, we need you to submit the following documents: {{documents}}. Please upload them to your profile by {{deadline}}.',
    variables: ['name', 'documents', 'deadline']
  }
]

export default function CommunicationHub() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [currentUser] = useState({ id: 'user-1', name: 'Current User', avatar: '' })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    // Mock data - replace with actual API call
    const mockConversations: Conversation[] = [
      {
        id: '1',
        type: 'direct',
        name: 'John Doe',
        avatar: '',
        participants: [
          { id: 'john-doe', name: 'John Doe', role: 'candidate', isOnline: true },
          { id: 'user-1', name: 'Current User', role: 'recruiter', isOnline: true }
        ],
        lastMessage: {
          id: 'msg-1',
          senderId: 'john-doe',
          senderName: 'John Doe',
          content: 'Thank you for the interview opportunity!',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'text',
          status: 'read'
        },
        unreadCount: 0,
        isPinned: true,
        isMuted: false,
        isActive: true,
        tags: ['interview', 'frontend']
      },
      {
        id: '2',
        type: 'whatsapp',
        name: 'Sarah Wilson',
        avatar: '',
        participants: [
          { id: 'sarah-wilson', name: 'Sarah Wilson', role: 'candidate', isOnline: false, lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { id: 'user-1', name: 'Current User', role: 'recruiter', isOnline: true }
        ],
        lastMessage: {
          id: 'msg-2',
          senderId: 'user-1',
          senderName: 'Current User',
          content: 'Hi Sarah, we would like to schedule an interview.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'text',
          status: 'delivered'
        },
        unreadCount: 2,
        isPinned: false,
        isMuted: false,
        isActive: true,
        tags: ['backend', 'python']
      },
      {
        id: '3',
        type: 'group',
        name: 'Frontend Team Hiring',
        avatar: '',
        participants: [
          { id: 'user-1', name: 'Current User', role: 'recruiter', isOnline: true },
          { id: 'jane-smith', name: 'Jane Smith', role: 'recruiter', isOnline: true },
          { id: 'mike-johnson', name: 'Mike Johnson', role: 'company', isOnline: false }
        ],
        lastMessage: {
          id: 'msg-3',
          senderId: 'jane-smith',
          senderName: 'Jane Smith',
          content: 'We have 3 strong candidates for the React position',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text',
          status: 'read'
        },
        unreadCount: 1,
        isPinned: false,
        isMuted: true,
        isActive: true,
        tags: ['team', 'hiring']
      }
    ]
    setConversations(mockConversations)
  }

  const loadMessages = async (conversationId: string) => {
    // Mock data - replace with actual API call
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        senderId: 'john-doe',
        senderName: 'John Doe',
        content: 'Hi, I saw the job posting for Frontend Developer position.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-2',
        senderId: 'user-1',
        senderName: 'Current User',
        content: 'Hello John! Thank you for your interest. I\'d love to discuss the opportunity with you.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-3',
        senderId: 'john-doe',
        senderName: 'John Doe',
        content: 'Great! I have attached my resume and portfolio for your review.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        type: 'text',
        status: 'read',
        attachments: [
          { id: 'att-1', name: 'John_Doe_Resume.pdf', type: 'document', url: '/files/resume.pdf', size: 245760 }
        ]
      },
      {
        id: 'msg-4',
        senderId: 'user-1',
        senderName: 'Current User',
        content: 'Perfect! I\'ll review your resume and get back to you by tomorrow with next steps.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-5',
        senderId: 'john-doe',
        senderName: 'John Doe',
        content: 'Thank you for the interview opportunity!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'text',
        status: 'read'
      }
    ]
    setMessages(mockMessages)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    }

    setMessages([...messages, message])
    setNewMessage('')

    // Simulate API call
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'sent' } : m
      ))
    }, 1000)

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: { ...message, status: 'sent' } }
        : conv
    ))
  }

  const sendWhatsAppMessage = async () => {
    if (!selectedTemplate || !selectedConversation) return

    let content = selectedTemplate.content
    Object.entries(templateVariables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    }

    setMessages([...messages, message])
    setShowWhatsAppDialog(false)
    setSelectedTemplate(null)
    setTemplateVariables({})

    // Simulate WhatsApp API integration
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'delivered' } : m
      ))
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm')
    } else if (isYesterday(timestamp)) {
      return 'Yesterday ' + format(timestamp, 'HH:mm')
    } else {
      return format(timestamp, 'MMM dd, HH:mm')
    }
  }

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === currentUser.id
    const showAvatar = !isOwn && (messages[messages.indexOf(message) - 1]?.senderId !== message.senderId)

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isOwn && showAvatar && (
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={message.senderAvatar} />
            <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${!isOwn && !showAvatar ? 'ml-10' : ''}`}>
          {!isOwn && showAvatar && (
            <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
          )}
          
          <div className={`rounded-lg px-3 py-2 ${
            isOwn 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm">{message.content}</p>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                    <File className="w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                      <p className="text-xs opacity-75">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">{formatMessageTime(message.timestamp)}</span>
            {isOwn && getMessageStatusIcon(message.status)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 h-[800px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
            <p className="text-sm text-gray-600">Manage all your candidate communications</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => setShowNewChatDialog(true)} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          <Button 
            onClick={() => setShowWhatsAppDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversations Sidebar */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" variant="ghost">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border-r-2 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.type === 'whatsapp' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                          {conversation.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                          {conversation.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <div className="flex items-center space-x-1 mt-1">
                          <p className="text-xs text-gray-600 truncate flex-1">
                            {conversation.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-1">
                        {conversation.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          {selectedConversation ? (
            <Card className="flex-1 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.avatar} />
                      <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.name}</h3>
                      <div className="flex items-center space-x-2">
                        {selectedConversation.type === 'direct' && (
                          <p className="text-xs text-gray-600">
                            {selectedConversation.participants.find(p => p.id !== currentUser.id)?.isOnline 
                              ? 'Online' 
                              : 'Last seen 2 hours ago'
                            }
                          </p>
                        )}
                        {selectedConversation.type === 'group' && (
                          <p className="text-xs text-gray-600">
                            {selectedConversation.participants.length} members
                          </p>
                        )}
                        {selectedConversation.type === 'whatsapp' && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            WhatsApp
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  {isTyping && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">Someone is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end space-x-2">
                  <Button size="sm" variant="ghost">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Textarea
                      ref={messageInputRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-0 resize-none"
                      rows={1}
                    />
                  </div>
                  <Button size="sm" variant="ghost">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* WhatsApp Template Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Choose a template and customize your WhatsApp message
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Message Template</label>
              <Select onValueChange={(value) => {
                const template = whatsappTemplates.find(t => t.id === value)
                setSelectedTemplate(template || null)
                if (template) {
                  const variables: Record<string, string> = {}
                  template.variables.forEach(v => variables[v] = '')
                  setTemplateVariables(variables)
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {whatsappTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${
                          template.category === 'interview' ? 'bg-blue-500' :
                          template.category === 'offer' ? 'bg-green-500' :
                          template.category === 'reminder' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        } text-white text-xs`}>
                          {template.category}
                        </Badge>
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Template Preview:</h4>
                  <p className="text-sm text-gray-700">{selectedTemplate.content}</p>
                </div>

                {selectedTemplate.variables.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Fill in Variables:</h4>
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm font-medium mb-1 capitalize">{variable}:</label>
                        <Input
                          placeholder={`Enter ${variable}`}
                          value={templateVariables[variable] || ''}
                          onChange={(e) => setTemplateVariables(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800">Final Message:</h4>
                  <p className="text-sm text-green-700">
                    {selectedTemplate.variables.reduce((content, variable) => {
                      return content.replace(
                        new RegExp(`{{${variable}}}`, 'g'),
                        templateVariables[variable] || `{{${variable}}}`
                      )
                    }, selectedTemplate.content)}
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={sendWhatsAppMessage}
                disabled={!selectedTemplate || selectedTemplate.variables.some(v => !templateVariables[v])}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Create a new chat with candidates or team members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Users</label>
              <Input placeholder="Enter name or email..." />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* Mock user list */}
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Alice Brown</p>
                  <p className="text-xs text-gray-600">Frontend Developer</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Charlie Davis</p>
                  <p className="text-xs text-gray-600">Backend Engineer</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
