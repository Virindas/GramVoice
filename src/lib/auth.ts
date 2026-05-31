export interface UserSession {
  id: string
  name: string
  phone: string
  role: 'villager' | 'admin'
  language: string
  address?: string
}

const SESSION_KEY = 'gramvoice_user_session'

export function saveUser(user: UserSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      language: user.language,
      address: user.address || ''
    }))
  }
}

export function getUser(): UserSession | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SESSION_KEY)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        return {
          id: parsed.id,
          name: parsed.name,
          phone: parsed.phone,
          role: parsed.role,
          language: parsed.language,
          address: parsed.address || ''
        }
      } catch (e) {
        console.error('Error parsing user session:', e)
        return null
      }
    }
  }
  return null
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.clear()
  }
}
