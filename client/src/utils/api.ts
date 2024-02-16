import axios from 'axios'

import { objectToQueryString } from '~/utils/string'
import { getStoredAuthToken, removeStoredAuthToken } from '~/utils/localStorage'

enum Method {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export interface Response {
  error: unknown
  data: unknown
  status: unknown
  statusText: string
}

const defaults = {
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8787',
  headers: () => ({
    'Content-Type': 'application/json',
    Authorization: getStoredAuthToken() ? `Bearer ${getStoredAuthToken()}` : undefined
  }),
  error: {
    statusText: 'INTERNAL_ERROR',
    error: 'Something went wrong. Please check your internet connection or contact our support.',
    status: 503,
    data: null
  }
}

const api = (method: Method, url: string, variables: object) =>
  new Promise((resolve, reject) => {
    axios({
      url: `${defaults.baseURL}${url}`,
      method,
      headers: defaults.headers(),
      params: method === Method.GET ? variables : undefined,
      data: method !== Method.GET ? variables : undefined,
      paramsSerializer: objectToQueryString
    }).then(
      (response) => {
        resolve(response.data)
      },
      (error) => {
        if (error.response) {
          if (error.response.data.error.code === 'INVALID_TOKEN') {
            removeStoredAuthToken()
          } else {
            reject(error.response.data.error)
          }
        } else {
          reject(defaults.error)
        }
      }
    )
  })

const optimisticUpdate = async (url, { updatedFields, currentFields, setLocalData }) => {
  try {
    setLocalData(updatedFields)
    await api(Method.PUT, url, updatedFields)
  } catch (error) {
    setLocalData(currentFields)
    console.log(error)
  }
}

export default {
  get: (...args) => api('get', ...args),
  post: (...args) => api('post', ...args),
  put: (...args) => api('put', ...args),
  patch: (...args) => api('patch', ...args),
  delete: (...args) => api('delete', ...args),
  optimisticUpdate
}
