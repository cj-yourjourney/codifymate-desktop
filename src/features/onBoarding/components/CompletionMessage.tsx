import React from 'react'
import { Check, Home, Rocket } from 'lucide-react'
import { navigateTo, ROUTES } from '@/shared/components/HashRouter'

interface CompletionMessageProps {
  show: boolean
}

export const CompletionMessage: React.FC<CompletionMessageProps> = ({
  show
}) => {
  const handleGetStarted = () => {
    navigateTo(ROUTES.SIGNUP) // or ROUTES.SIGNIN depending on your preference
  }

  const handleGoHome = () => {
    navigateTo(ROUTES.INDEX)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-40">
      <div className="flex items-center space-x-2 mb-2">
        <Check className="w-4 h-4" />
        <h4 className="font-medium text-sm">Tutorial Complete!</h4>
      </div>
      <p className="text-xs text-green-100 mb-3">
        You've learned how to use the AI Code Assistant. Ready to build your own
        features?
      </p>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleGetStarted}
          className="flex-1 bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-green-50 flex items-center justify-center space-x-1"
        >
          <Rocket className="w-3 h-3" />
          <span>Get Started</span>
        </button>
        <button
          onClick={handleGoHome}
          className="px-3 py-1 bg-green-700 rounded text-xs hover:bg-green-800 flex items-center justify-center"
        >
          <Home className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
