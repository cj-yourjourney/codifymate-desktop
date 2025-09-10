// src/shared/components/HashRouter.tsx
import { useEffect, useState, ComponentType } from 'react'
import { useAuth } from '@/shared/components/AuthContext'

// Import pages for routing
import AiCodeAssistant from '@/pages/ai-code-assistant'
import SignInForm from '@/features/auth/SignInForm'
import SignUpForm from '@/features/auth/SignUpForm'

interface RouteConfig {
  [key: string]: ComponentType<any>
}

interface HashRouterProps {
  fallbackComponent?: ComponentType<any>
}

const HashRouter: React.FC<HashRouterProps> = ({ fallbackComponent }) => {
  const [currentPage, setCurrentPage] = useState<string>('')
  const { user, loading } = useAuth()

  // Define your routes here - Fixed route names to match ROUTES constants
  const routes: RouteConfig = {
    'sign-in': SignInForm,
    '': SignInForm, // Default route
    'sign-up': SignUpForm,
    'ai-code-assistant': AiCodeAssistant
  }

  // Define which routes require authentication
  const protectedRoutes = ['ai-code-assistant']

  // Define which routes should redirect authenticated users
  const publicOnlyRoutes = ['sign-in', 'sign-up', '']

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace('#/', '')
      setCurrentPage(hash || '')
    }

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash)

    // Check initial hash on mount
    checkHash()

    // Cleanup listener on unmount
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Handle route protection and redirection
  useEffect(() => {
    if (loading) return // Don't do anything while auth is loading

    const currentRoute = currentPage || ''

    // If user is authenticated and tries to access public-only routes, redirect to ai-code-assistant
    if (user && publicOnlyRoutes.includes(currentRoute)) {
      window.location.hash = '#/ai-code-assistant'
      return
    }

    // If user is not authenticated and tries to access protected routes, redirect to sign-in
    if (!user && protectedRoutes.includes(currentRoute)) {
      window.location.hash = '#/sign-in'
      return
    }

    // If user is not authenticated and no specific route, go to sign-in
    if (!user && currentRoute === '') {
      window.location.hash = '#/sign-in'
      return
    }
  }, [user, loading, currentPage])

  // Get the component for current route
  const getCurrentComponent = (): ComponentType<any> => {
    // If still loading auth, show loading state
    if (loading) {
      return () => (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg"></span>
            <span>Loading...</span>
          </div>
        </div>
      )
    }

    const route = currentPage || ''
    const RouteComponent = routes[route]

    if (RouteComponent) {
      return RouteComponent
    }

    // Fallback to sign-in for unknown routes
    return routes['sign-in'] || SignInForm
  }

  const CurrentComponent = getCurrentComponent()

  return <CurrentComponent />
}

export default HashRouter

// Export a utility function for programmatic navigation
export const navigateTo = (route: string) => {
  window.location.hash = `#/${route}`
}

// Export route constants for type safety - Fixed to match route definitions
export const ROUTES = {
  SIGNIN: 'sign-in',
  SIGNUP: 'sign-up',
  AI_CODE_ASSISTANT: 'ai-code-assistant'
} as const

export type RouteType = (typeof ROUTES)[keyof typeof ROUTES]
