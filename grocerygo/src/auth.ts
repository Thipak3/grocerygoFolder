import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db"
import bcrypt from "bcryptjs"
import User from "./models/user.model"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("email and password are required")
        }

        await connectDb()
        const email = credentials.email
        const password = String(credentials.password)
        const user = await User.findOne({ email })
        if (!user) {
          throw new Error("user does not exist")
        }
        if (!user.password) {
          throw new Error("please sign in with google")
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          throw new Error("incorrect password")
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          mobile: user.mobile ?? "",
        }
      }
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    // Runs on sign in
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDb()
        let dbUser = await User.findOne({ email: user.email })
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image, // fixed casing: was "Image"
          })
        }
        user.id = dbUser._id.toString()
        user.role = dbUser.role
        user.mobile = dbUser.mobile ?? ""
      }
      return true
    },

    // Puts data into the token. Handles both initial sign-in and manual updates.
    async jwt({ token, user, trigger, session }) {
  // Initial sign in
  if (user) {
    token.id = user.id.toString()
    token.name = user.name
    token.email = user.email
    token.role = user.role
    token.mobile = user.mobile
  }

  // Triggered by `update()` from the client (e.g. after role selection)
  if (trigger === "update") {
    if (session?.role) token.role = session.role
    if (session?.mobile) token.mobile = session.mobile
  }

  return token
},

session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string
    session.user.name = token.name as string
    session.user.email = token.email as string
    session.user.role = token.role as string
    session.user.mobile = token.mobile as string
  }
  return session
},
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60
  },
  secret: process.env.AUTH_SECRET
})