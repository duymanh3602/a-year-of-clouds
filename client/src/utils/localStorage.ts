const auth_token = import.meta.env.VITE_AUTH_TOKEN ?? 'sb-gqgpxrvfgyldgwhvmkof-auth-token'

export const getStoredAuthToken = () => {
  const token = JSON.parse(localStorage.getItem(auth_token) ?? '')
  return token.access_token ?? null
}

export const removeStoredAuthToken = () => localStorage.removeItem('authToken')

export const getCurrentUserId = () => {
  const data = localStorage.getItem(auth_token) ?? ''
  const user = JSON.parse(data)
  return user.user.id ?? null
}
