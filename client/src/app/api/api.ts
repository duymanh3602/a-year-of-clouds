import { UUID } from 'crypto'
import api from '~/utils/api'

export const heathCheck = async () => {
  const response = api.get('/health-check')
  return response
}

export const getConversationList = async () => {
  const response = api.get('/api/v1/get-conversation-list')
  return response
}

export const findUser = async (word: string) => {
  const response = api.get(`/api/v1/get-find-user?find=${word}`, { params: { find: word } })
  return response
}

export const getConversation = async (id: unknown) => {
  const response = api.get(`/api/v1/get-conversation/${id}`)
  return response
}

export const sendMessage = async (id: unknown, content: string) => {
  const body = { connect_id: id, content: content }
  const response = api.post(`/api/v1/send-message`, body)
  return response
}

export const getChatConfirm = async (id: UUID) => {
  const response = api.get(`/api/v1/get-chat-confirm/${id}`)
  return response
}

export const seenMessage = async (id: UUID) => {
  const response = api.get(`/api/v1/seen-message/${id}`)
  return response
}

export const updateChatConfirm = async (id: UUID, isAccepted: boolean) => {
  const response = api.get(`/api/v1/update-accept-chat/${id}?status=${isAccepted}`)
  return response
}

export const createNewChat = async (id: UUID) => {
  const response = api.get(`/api/v1/create-new-chat/${id}`)
  return response
}

export const getIsConnected = async (id: UUID) => {
  const response = api.get(`/api/v1/get-is-connected/${id}`)
  return response
}
