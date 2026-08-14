import { Connection } from "mongoose"
import { DefaultSession } from "next-auth"

declare global {
  var mongoose: {
    conn: Connection | null
    promise: Promise<Connection> | null
  }
}

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
    mobile: string
  }

  interface Session {
    user: {
      id: string
      role: string
      mobile: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    mobile: string
  }
}

export {}
