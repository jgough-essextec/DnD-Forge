export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string
  dateJoined: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  passwordConfirm: string
}

export interface ProfileUpdateData {
  email?: string
  displayName?: string
  avatarUrl?: string
  preferences?: Record<string, unknown>
}
