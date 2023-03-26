import { createContext, useState } from 'react'

interface AuthProps {
  authenticated: boolean
  login: () => void
  logOut: () => void
}

const defaultValue: AuthProps = {
  authenticated: false,
  login: () => undefined,
  logOut: () => undefined,
}

const AuthContext = createContext<AuthProps>(defaultValue)

export const AuthProvider: React.FC = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(defaultValue.authenticated)
  const login = () => setAuthenticated(true)
  const logOut = () => setAuthenticated(false)

  return (
    <AuthContext.Provider value={{ authenticated, login, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
