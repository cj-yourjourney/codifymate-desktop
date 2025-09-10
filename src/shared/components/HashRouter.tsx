// src/shared/components/HashRouter.tsx
import { useEffect, useState, ComponentType } from 'react'
import { useAuth } from '@/shared/components/AuthContext'

// Import pages for routing
import AiCodeAssistant from '@/pages/ai-code-assistant'
import SignInForm from '@/features/auth/SignInForm'
import SignUpForm from '@/features/auth/SignUpForm'
import IndexPage from '@/pages/index' // ✅ import index page

interface RouteConfig {
  [key: string]: ComponentType<any>
}

interface HashRouterProps {
  fallbackComponent?: ComponentType<any>
}

const HashRouter: React.FC<HashRouterProps> = ({ fallbackComponent }) => {
  const [currentPage, setCurrentPage] = useState<string>('')
  const { user, loading } = useAuth()

  // ✅ routes mapping
  const routes: RouteConfig = {
    '': IndexPage, // root → index.tsx
    'sign-in': SignInForm,
    'sign-up': SignUpForm,
    'ai-code-assistant': AiCodeAssistant
  }

  const protectedRoutes = ['ai-code-assistant']
  const publicOnlyRoutes = ['sign-in', 'sign-up']

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
     // 👇 instead of always redirecting to sign-in,
     // send them back to index if they just logged out
     window.location.hash = '#/'
     return
   }
 }, [user, loading, currentPage])


  const getCurrentComponent = (): ComponentType<any> => {
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

    if (RouteComponent) return RouteComponent

    return fallbackComponent || SignInForm
  }

  const CurrentComponent = getCurrentComponent()
  return <CurrentComponent />
}

export default HashRouter

export const navigateTo = (route: string) => {
  if (route === '') {
    window.location.hash = '#/' // ✅ ensures root works
  } else {
    window.location.hash = `#/${route}`
  }
}

export const ROUTES = {
  INDEX: '',
  SIGNIN: 'sign-in',
  SIGNUP: 'sign-up',
  AI_CODE_ASSISTANT: 'ai-code-assistant'
} as const

export type RouteType = (typeof ROUTES)[keyof typeof ROUTES]
