// Modified for: modify the Home(index.tsx) component:

import { useState, useEffect } from 'react'
import { Code2, Play } from 'lucide-react'
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
        {/* Logo and Header */}
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
        </div>

        {/* Sign Up / Sign In Buttons Section */}
        <div className="space-y-3 mb-8">
          {/* Sign Up Button */}
          <button
            onClick={() => navigateTo(ROUTES.SIGNUP)}
            className="btn btn-primary w-full shadow-sm hover:shadow-md transition-shadow"
          >
            Sign Up
          </button>
          {/* Sign In Button */}
          <button
            onClick={() => navigateTo(ROUTES.SIGNIN)}
            className="btn btn-outline w-full hover:shadow-sm transition-shadow"
          >
            Sign In
          </button>
        </div>

        {/* Divider between authentication and demo sections */}
        <div className="border-t border-gray-300 my-4"></div>

        {/* Try Interactive Demo Button Section */}
        <div className="mb-8">
          {/* Separated container for demo button to enhance layout clarity */}
          <button
            onClick={() => navigateTo(ROUTES.ON_BOARDING)}
            className="btn btn-outline w-full hover:shadow-sm transition-shadow"
          >
            <Play className="w-4 h-4 mr-2" />
            Try Interactive Demo
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

