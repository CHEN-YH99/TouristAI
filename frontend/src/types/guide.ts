export interface Guide {
  id: string
  userId: string
  sessionId?: string
  title: string
  content: string
  destination?: string
  days?: number
  budget?: number
  tags: string[]
  isPublic: boolean
  viewCount: number
  likeCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateGuideRequest {
  sessionId?: string
  title: string
  content: string
  destination?: string
  days?: number
  budget?: number
  tags?: string[]
  isPublic?: boolean
}
