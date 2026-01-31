import { AuthProvider, AuthProviderType, AuthConfig } from './authProvider'
import { TokenAuthProvider } from './tokenAuthProvider'
import { FormAuthProvider } from './formAuthProvider'

export class AuthProviderFactory {
  static create(config: AuthConfig): AuthProvider {
    const providerType = config.preferredProvider ?? AuthProviderType.FORM

    if (providerType === AuthProviderType.TOKEN) {
      return new TokenAuthProvider(config.username, config.password)
    }

    return new FormAuthProvider(config.username, config.password)
  }
}
