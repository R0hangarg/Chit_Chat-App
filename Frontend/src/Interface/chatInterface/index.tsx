export interface ChatInterface {
    id: string
    senderId: string
    receiverId: string
    content: string 
    updatedAt: Date
    createdAt: Date
    isRead: boolean
    chatsId: string
}