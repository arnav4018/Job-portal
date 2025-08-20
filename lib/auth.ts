import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { createAuditLog } from './audit'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : undefined,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        }
      }
    }),
  ].filter(provider => {
    // Only include Google provider if credentials are provided
    if (provider.id === 'google') {
      return process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    }
    // Only include email provider if SMTP is configured
    if (provider.id === 'email') {
      return process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
    }
    return true
  }),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Check if user is suspended
      if (user.status === 'SUSPENDED') {
        return false
      }

      // Create audit log for login
      try {
        await createAuditLog({
          userId: user.id,
          action: 'LOGIN',
          resource: 'user',
          resourceId: user.id,
          metadata: JSON.stringify({
            provider: account?.provider,
            type: account?.type,
          }),
        })
      } catch (error) {
        console.error('Failed to create login audit log:', error)
      }

      return true
    },
  },
  events: {
    async createUser({ user }) {
      // Create audit log for user creation
      try {
        await createAuditLog({
          userId: user.id,
          action: 'CREATE',
          resource: 'user',
          resourceId: user.id,
          newData: JSON.stringify({
            email: user.email,
            name: user.name,
            role: user.role,
          }),
        })
      } catch (error) {
        console.error('Failed to create user creation audit log:', error)
      }
    },
  },
}

declare module 'next-auth' {
  interface User {
    role: string
    status: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
      status: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    status: string
  }
}