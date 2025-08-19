import NextAuth from "next-auth"
import { User, Company, Profile } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      profile?: Profile | null
      company?: Company | null
    }
  }
}
