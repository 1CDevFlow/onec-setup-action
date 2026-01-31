import { HttpClient } from '../httpClient'

export interface AuthProvider {
  authenticate(httpClient: HttpClient): Promise<void>
}

export enum AuthProviderType {
  TOKEN = 'token',
  FORM = 'form'
}

export interface AuthConfig {
  username: string
  password: string
  preferredProvider?: AuthProviderType
}
