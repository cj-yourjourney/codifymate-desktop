// src/shared/components/HashRouter.tsx
import { useEffect, useState, ComponentType, useCallback, useMemo } from 'react'
import { useAuth } from '@/shared/components/AuthContext'

// Import pages for routing
import AiCodeAssistant from '@/pages/ai-code-assistant'
import SignInForm from '@/features/auth/SignInForm'
import SignUpForm from '@/features/auth/SignUpForm'
import OnboardingComponent from '@/pages/on-boarding'
import IndexPage from '@/pages/index' // ✅ import index page

interface RouteConfig {
  [key: string]: ComponentType<Record<string, unknown>>
}

interface HashRouterProps {
  fallbackComponent?: ComponentType<Record<string, unknown>>
}

const HashRouter: React.FC<HashRouterProps> = ({ fallbackComponent }) => {
  const [currentPage, setCurrentPage] = useState<string>('')
  const { user, loading } = useAuth()

  // ✅ Memoize routes so it doesn't re-create each render
  const routes: RouteConfig = useMemo(
    () => ({
      '': IndexPage,
      'sign-in': SignInForm,
      'sign-up': SignUpForm,
      'on-boarding': OnboardingComponent,
      'ai-code-assistant': AiCodeAssistant
    }),
    []
  )

  // ✅ Memoize route lists
  const protectedRoutes = useMemo(() => ['ai-code-assistant'], [])
  const publicOnlyRoutes = useMemo(
    () => ['sign-in', 'sign-up', 'on-boarding'],
    []
  )

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace('#/', '')
      setCurrentPage(hash || '')
    }

    window.addEventListener('hashchange', checkHash)
    checkHash()

    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  useEffect(() => {
    if (loading) return
    const currentRoute = currentPage || ''

    if (user && publicOnlyRoutes.includes(currentRoute)) {
      window.location.hash = '#/ai-code-assistant'
      return
    }

    if (!user && protectedRoutes.includes(currentRoute)) {
      window.location.hash = '#/'
      return
    }
  }, [user, loading, currentPage, protectedRoutes, publicOnlyRoutes])

  const getCurrentComponent = useCallback((): ComponentType<
    Record<string, unknown>
  > => {
    if (loading) {
      const LoadingComponent: ComponentType<Record<string, unknown>> = () => (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg"></span>
            <span>Loading...</span>
          </div>
        </div>
      )
      LoadingComponent.displayName = 'LoadingComponent'
      return LoadingComponent
    }

    const route = currentPage || ''
    const RouteComponent = routes[route]

    if (RouteComponent) return RouteComponent

    return fallbackComponent || SignInForm
  }, [loading, currentPage, routes, fallbackComponent])

  const CurrentComponent = getCurrentComponent()
  return <CurrentComponent />
}

export default HashRouter

// ✅ keep navigateTo helper + constants
export const navigateTo = (route: string) => {
  window.location.hash = route === '' ? '#/' : `#/${route}`
}

export const ROUTES = {
  INDEX: '',
  SIGNIN: 'sign-in',
  SIGNUP: 'sign-up',
  ON_BOARDING: 'on-boarding',
  AI_CODE_ASSISTANT: 'ai-code-assistant'
} as const

export type RouteType = (typeof ROUTES)[keyof typeof ROUTES]
