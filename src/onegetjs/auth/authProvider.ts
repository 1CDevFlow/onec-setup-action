export interface AuthProvider {
  authenticate(): Promise<void>
  get(
    url: string,
    options?: any
  ): Promise<{ data: any; request: any; status: number; headers?: any }>
  getCookies(): string
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
