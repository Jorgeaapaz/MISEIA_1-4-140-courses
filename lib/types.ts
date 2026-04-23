import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  role: 'admin' | 'student'
  createdAt: Date
}

export interface Course {
  _id?: ObjectId
  title: string
  description: string
  order: number
  createdAt: Date
}

export interface Section {
  _id?: ObjectId
  courseId: ObjectId
  title: string
  description: string
  order: number
  createdAt: Date
}

export interface Resource {
  _id?: ObjectId
  sectionId: ObjectId
  title: string
  content: string // Markdown
  order: number
  createdAt: Date
}

export interface Feedback {
  _id?: ObjectId
  resourceId: ObjectId
  userId: ObjectId
  comment: string
  createdAt: Date
}

export interface MagicLink {
  _id?: ObjectId
  email: string
  token: string
  expiresAt: Date
  used: boolean
}

// Serializable versions for client-side use (ObjectId → string)
export interface SerializedUser {
  id: string
  email: string
  role: 'admin' | 'student'
  createdAt: string
}

export interface SerializedCourse {
  id: string
  title: string
  description: string
  order: number
  createdAt: string
}

export interface SerializedSection {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  createdAt: string
}

export interface SerializedResource {
  id: string
  sectionId: string
  title: string
  content: string
  order: number
  createdAt: string
}

export interface SerializedFeedback {
  id: string
  resourceId: string
  userId: string
  userEmail?: string
  comment: string
  createdAt: string
}

export interface JWTPayload {
  sub: string // user id
  email: string
  role: 'admin' | 'student'
  iat?: number
  exp?: number
}

export interface MagicLinkPayload {
  email: string
  type: 'magic-link'
  iat?: number
  exp?: number
}
