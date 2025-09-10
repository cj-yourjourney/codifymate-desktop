// src/shared/components/HashRouter.tsx
import { useEffect, useState, ComponentType } from 'react'

// Import pages for routing
import AiCodeAssistant from '@/pages/ai-code-assistant'
import SignInForm from '@/features/auth/SignInForm'
import SignUpForm from '@/features/auth/SignUpForm'
// import PaymentPage from '@/pages/payment'  // Uncomment when created

interface RouteConfig {
  [key: string]: ComponentType<any>
}

interface HashRouterProps {
  fallbackComponent?: ComponentType<any>
}

const HashRouter: React.FC<HashRouterProps> = ({ fallbackComponent }) => {
  const [currentPage, setCurrentPage] = useState<string>('')

  // Define your routes here
  const routes: RouteConfig = {
    signin: SignInForm,
    '': SignInForm, // Default route
    signup: SignUpForm,
    'ai-code-assistant': AiCodeAssistant
    // 'payment': PaymentPage, // Uncomment when created
  }

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace('#/', '')
      setCurrentPage(hash || 'signin')
    }

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash)

    // Check initial hash on mount
    checkHash()

    // Cleanup listener on unmount
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Get the component for current route
  const getCurrentComponent = (): ComponentType<any> => {
    const RouteComponent = routes[currentPage]

    if (RouteComponent) {
      return RouteComponent
    }

    // Fallback to default route or provided fallback
    return fallbackComponent || routes['signin'] || SignInForm
  }

  const CurrentComponent = getCurrentComponent()

  return <CurrentComponent />
}

export default HashRouter

// Export a utility function for programmatic navigation
export const navigateTo = (route: string) => {
  window.location.hash = `#/${route}`
}

// Export route constants for type safety
export const ROUTES = {
  SIGNIN: 'signin',
  SIGNUP: 'signup',
  AI_CODE_ASSISTANT: 'ai-code-assistant'
  // PAYMENT: 'payment', // Uncomment when created
} as const

export type RouteType = (typeof ROUTES)[keyof typeof ROUTES]
