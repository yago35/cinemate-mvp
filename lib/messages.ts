export type Message = {
  id: string
  senderId: string
  text: string
  timestamp: string
}

export type Conversation = {
  profileId: string
  messages: Message[]
}

export const CONVERSATIONS: Conversation[] = [
  {
    profileId: "maya",
    messages: [
      { id: "1", senderId: "maya", text: "Your top 4 is *chef's kiss*. Have you seen the new A24 one?", timestamp: "2h ago" },
      { id: "2", senderId: "me", text: "Not yet! It's been on my watchlist for weeks", timestamp: "1h ago" },
      { id: "3", senderId: "maya", text: "We should watch it together 🎬", timestamp: "45m ago" },
    ],
  },
  {
    profileId: "theo",
    messages: [
      { id: "4", senderId: "theo", text: "Fellow noir enthusiast! What did you think about Midnight Express Line?", timestamp: "1d ago" },
      { id: "5", senderId: "me", text: "Absolute masterpiece. The cinematography alone deserves 5 stars.", timestamp: "1d ago" },
    ],
  },
  {
    profileId: "lena",
    messages: [
      { id: "6", senderId: "lena", text: "Merhaba! I noticed you rated Neon Tide 5 stars too 💚", timestamp: "3d ago" },
    ],
  },
]

export function getConversation(profileId: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.profileId === profileId)
}
