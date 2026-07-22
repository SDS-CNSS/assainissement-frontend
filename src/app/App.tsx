import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { AppProviders } from './providers'
import { router } from './router'

// Import side-effect : enregistre les intercepteurs Axios
import '@/api/client'

export function App() {
  return (
    <AppProviders>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppProviders>
  )
}
