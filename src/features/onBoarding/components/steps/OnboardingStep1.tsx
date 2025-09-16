// components/steps/OnboardingStep1.tsx
import React, { useEffect } from 'react'
import { BarChart3, FileText, PlayCircle } from 'lucide-react'
import { MockAssessment } from '../../types/onboarding'
import { mockAssessment } from '../../constants/mockData'

interface OnboardingStep1Props {
  userPrompt: string
  setUserPrompt: (prompt: string) => void
  isAssessing: boolean
  setIsAssessing: (assessing: boolean) => void
  assessment: MockAssessment | null
  setAssessment: React.Dispatch<React.SetStateAction<MockAssessment | null>> // ✅ fix
  currentAnimation: number
  setCurrentAnimation: (animation: number) => void
  onContinue: () => void
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  userPrompt,
  setUserPrompt,
  isAssessing,
  setIsAssessing,
  assessment,
  setAssessment,
  currentAnimation,
  setCurrentAnimation,
  onContinue
}) => {
  // Simulate step progression for demo
  useEffect(() => {
    if (userPrompt && currentAnimation === 1) {
      const timer = setTimeout(() => {
        setIsAssessing(true)
        setTimeout(() => {
          setIsAssessing(false)
          setAssessment(mockAssessment)
        }, 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [userPrompt, currentAnimation, setIsAssessing, setAssessment])

  const handleDemoPrompt = () => {
    setUserPrompt(
      'Create a login page with email and password fields, form validation, and responsive design using React and TypeScript'
    )
    setCurrentAnimation(1)
  }

  const handleAssess = () => {
    if (userPrompt) {
      setIsAssessing(true)
      setTimeout(() => {
        setIsAssessing(false)
        setAssessment(mockAssessment)
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Assessment Result */}
        {assessment && (
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {assessment.score}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {assessment.content.title}
                  </h3>
                  <p className="text-sm text-gray-500">{assessment.category}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                {assessment.score}/10
              </span>
            </div>

            <div className="space-y-2">
              {assessment.content.items.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Describe what you want to build
              </label>
              <textarea
                className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Be specific about functionality, tech stack, UI requirements..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />

              {/* Demo button */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Try a sample prompt
                    </p>
                    <p className="text-xs text-blue-700">
                      Click to see how a good prompt looks
                    </p>
                  </div>
                  <button
                    onClick={handleDemoPrompt}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <PlayCircle className="w-3 h-3" />
                    <span>Demo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-medium text-gray-900 mb-4">Actions</h3>

              <button
                onClick={handleAssess}
                disabled={!userPrompt.trim() || isAssessing}
                className={`w-full mb-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isAssessing || !userPrompt.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAssessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Assessing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {assessment ? 'Assess Again' : 'Assess Prompt'}
                  </span>
                )}
              </button>

              {assessment && (
                <button
                  onClick={onContinue}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <span className="flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Continue
                  </span>
                </button>
              )}

              {assessment && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Score:</span>
                    <span className="font-medium">{assessment.score}/10</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
