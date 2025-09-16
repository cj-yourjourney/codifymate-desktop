import { useState, useEffect } from 'react'
import { Code2, Play, Sparkles } from 'lucide-react'
import { navigateTo, ROUTES } from '@/shared/components/HashRouter'

export default function Home() {
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        {/* Logo */}
        <div className="mb-16">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-8">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-base-content mb-6">
            CodifyMate
          </h1>
          <p className="text-base-content/60 mb-2">
            AI Code Assistant for Frontend Developers
          </p>
          {/* Small demo hint */}
          <p className="text-sm text-primary/70 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Learn how it works in 3 steps
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => navigateTo(ROUTES.SIGNUP)}
            className="btn btn-primary w-full shadow-sm hover:shadow-md transition-shadow"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigateTo(ROUTES.SIGNIN)}
            className="btn btn-outline w-full hover:shadow-sm transition-shadow"
          >
            Sign In
          </button>

          {/* Enhanced demo button */}
          <div className="relative">
            <button
              onClick={() => navigateTo(ROUTES.ON_BOARDING)}
              className="btn btn-outline w-full hover:shadow-sm transition-all duration-200 group border-primary/30 hover:border-primary"
            >
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Try Interactive Demo
            </button>
            {/* Optional: Small badge to make it more noticeable */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Optional: Demo preview features */}
        <div className="mb-8 p-4 bg-base-200/50 rounded-lg border border-base-300/50">
          <p className="text-xs text-base-content/60 mb-2 font-medium">
            Demo includes:
          </p>
          <div className="text-xs text-base-content/50 space-y-1">
            <div>✓ Prompt refinement with AI feedback</div>
            <div>✓ Smart file selection</div>
            <div>✓ Live code generation</div>
          </div>
        </div>

        {/* Version Info */}
        {appVersion && (
          <div className="text-xs text-base-content/40 bg-base-200 px-3 py-1 rounded-full inline-block">
            v{appVersion}
          </div>
        )}
      </div>
    </div>
  )
}

// Alternative simpler version if you prefer minimal changes:
export function HomeSimple() {
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        {/* Logo */}
        <div className="mb-16">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-8">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-base-content mb-6">
            CodifyMate
          </h1>
          <p className="text-base-content/60">
            AI Code Assistant for Frontend Developers
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => navigateTo(ROUTES.SIGNUP)}
            className="btn btn-primary w-full shadow-sm hover:shadow-md transition-shadow"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigateTo(ROUTES.SIGNIN)}
            className="btn btn-outline w-full hover:shadow-sm transition-shadow"
          >
            Sign In
          </button>

          {/* Just change the button text and add an icon */}
          <button
            onClick={() => navigateTo(ROUTES.ON_BOARDING)}
            className="btn btn-outline w-full hover:shadow-sm transition-shadow text-primary border-primary/30"
          >
            <Play className="w-4 h-4 mr-2" />
            See How It Works
          </button>
        </div>

        {/* Version Info */}
        {appVersion && (
          <div className="text-xs text-base-content/40 bg-base-200 px-3 py-1 rounded-full inline-block">
            v{appVersion}
          </div>
        )}
      </div>
    </div>
  )
}
