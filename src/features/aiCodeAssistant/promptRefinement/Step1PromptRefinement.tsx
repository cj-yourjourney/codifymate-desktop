// components/Step1PromptRefinement.tsx
import React, { useState } from 'react'
import {
  Edit3,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles
} from 'lucide-react'

interface Assessment {
  score: number
  type: 'improvement' | 'excellent'
  content: {
    title: string
    items: string[]
  }
}

interface Step1PromptRefinementProps {
  userPrompt?: string
  setUserPrompt?: (prompt: string) => void
  assessment?: Assessment | null
  isAssessing?: boolean
  onAssessPrompt?: () => void
  onNavigateToStep2?: () => void
}

const Step1PromptRefinement: React.FC<Step1PromptRefinementProps> = ({
  userPrompt: externalUserPrompt,
  setUserPrompt: externalSetUserPrompt,
  assessment: externalAssessment,
  isAssessing: externalIsAssessing,
  onAssessPrompt: externalOnAssessPrompt,
  onNavigateToStep2
}) => {
  // Use external props if provided, otherwise use local state
  const [localUserPrompt, setLocalUserPrompt] = useState('')
  const [localAssessment, setLocalAssessment] = useState<Assessment | null>(
    null
  )
  const [localIsAssessing, setLocalIsAssessing] = useState(false)

  const userPrompt =
    externalUserPrompt !== undefined ? externalUserPrompt : localUserPrompt
  const setUserPrompt = externalSetUserPrompt || setLocalUserPrompt
  const assessment =
    externalAssessment !== undefined ? externalAssessment : localAssessment
  const isAssessing =
    externalIsAssessing !== undefined ? externalIsAssessing : localIsAssessing

  // Mock assessment data
  const mockAssessments: Assessment[] = [
    {
      score: 4,
      type: 'improvement',
      content: {
        title: 'Your prompt needs more detail',
        items: [
          'What specific features or functionality should be included?',
          'What technology stack or framework should be used?',
          'Are there any design preferences or constraints to consider?'
        ]
      }
    },
    {
      score: 9,
      type: 'excellent',
      content: {
        title: "Excellent prompt! Here's why:",
        items: [
          'Clear and specific requirements with detailed functionality description',
          'Includes technical specifications and implementation preferences',
          'Provides context about integration needs and existing system constraints'
        ]
      }
    }
  ]

  // Handle prompt assessment
  const handleAssessPrompt = async () => {
    if (externalOnAssessPrompt) {
      // Use external assessment function if provided
      externalOnAssessPrompt()
      return
    }

    // Otherwise use local assessment logic
    if (!userPrompt.trim()) {
      return
    }

    setLocalIsAssessing(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Randomly select one of the mock assessments
    const randomAssessment =
      mockAssessments[Math.floor(Math.random() * mockAssessments.length)]
    setLocalAssessment(randomAssessment)
    setLocalIsAssessing(false)
  }

  const shouldShowSelectFiles = assessment && assessment.score >= 7
  const buttonText = shouldShowSelectFiles
    ? 'Select Reference Files'
    : 'Assess Your Prompt'

  const handleButtonClick = () => {
    if (shouldShowSelectFiles && onNavigateToStep2) {
      // Navigate to step 2 when "Select Reference Files" is clicked
      onNavigateToStep2()
    } else {
      // Use external assessment function if provided, otherwise use local
      if (externalOnAssessPrompt) {
        externalOnAssessPrompt()
      } else {
        handleAssessPrompt()
      }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success'
    if (score >= 6) return 'text-warning'
    return 'text-error'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'badge-success'
    if (score >= 6) return 'badge-warning'
    return 'badge-error'
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[calc(100vh-8rem)]">
          {/* Left Panel - Prompt Input */}
          <div className="flex flex-col">
            <div className="card bg-base-100 shadow-lg border border-base-200 flex-1 flex flex-col">
              <div className="card-body p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <Edit3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-base-content">
                      Write Your Prompt
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Describe what you want the AI to help you build
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    className="textarea textarea-bordered text-base resize-none focus:textarea-primary transition-colors w-full h-48"
                    placeholder="e.g., Create a user authentication component with form validation, password strength indicator, and integration with our existing API..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                  />

                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-xs text-base-content/50">
                      {userPrompt.length} characters
                    </span>
                    <span className="text-xs text-base-content/50">
                      💡 Be specific and detailed for better results
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    className={`btn w-full ${
                      shouldShowSelectFiles ? 'btn-success' : 'btn-primary'
                    } ${isAssessing ? 'loading' : ''}`}
                    onClick={handleButtonClick}
                    disabled={!userPrompt.trim() || isAssessing}
                  >
                    {!isAssessing &&
                      (shouldShowSelectFiles ? (
                        <FileText className="w-4 h-4 mr-2" />
                      ) : (
                        <BarChart3 className="w-4 h-4 mr-2" />
                      ))}
                    {isAssessing ? 'Assessing...' : buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Assessment Results */}
          <div className="flex flex-col">
            <div className="card bg-base-100 shadow-lg border border-base-200 flex-1">
              <div className="card-body p-6 h-full">
                {!assessment ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-base-content/40" />
                    </div>
                    <h3 className="text-lg font-semibold text-base-content mb-2">
                      Prompt Assessment
                    </h3>
                    <p className="text-base-content/60 max-w-sm">
                      Write your prompt and click "Assess Your Prompt" to get
                      detailed feedback and suggestions for improvement.
                    </p>
                  </div>
                ) : (
                  // Assessment results
                  <div className="h-full flex flex-col">
                    {/* Score Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-base-content">
                            Assessment Results
                          </h3>
                          <p className="text-sm text-base-content/60">
                            Analysis of your prompt quality
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            assessment.score
                          )}`}
                        >
                          {assessment.score}/10
                        </div>
                        <div
                          className={`badge ${getScoreBadgeColor(
                            assessment.score
                          )} badge-sm`}
                        >
                          {assessment.score >= 8
                            ? 'Excellent'
                            : assessment.score >= 6
                            ? 'Good'
                            : 'Needs Work'}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-base-content/60 mb-1">
                        <span>Prompt Quality</span>
                        <span>{assessment.score * 10}%</span>
                      </div>
                      <progress
                        className={`progress w-full ${
                          assessment.score >= 8
                            ? 'progress-success'
                            : assessment.score >= 6
                            ? 'progress-warning'
                            : 'progress-error'
                        }`}
                        value={assessment.score * 10}
                        max="100"
                      ></progress>
                    </div>

                    {/* Assessment Content */}
                    <div className="flex-1">
                      <div
                        className={`p-4 rounded-lg border ${
                          assessment.type === 'excellent'
                            ? 'bg-success/10 border-success/20'
                            : 'bg-warning/10 border-warning/20'
                        }`}
                      >
                        <div className="flex items-start mb-3">
                          {assessment.type === 'excellent' ? (
                            <CheckCircle2 className="w-5 h-5 text-success mr-2 mt-0.5 flex-shrink-0" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-warning mr-2 mt-0.5 flex-shrink-0" />
                          )}
                          <h4
                            className={`font-semibold ${
                              assessment.type === 'excellent'
                                ? 'text-success'
                                : 'text-warning'
                            }`}
                          >
                            {assessment.content.title}
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {assessment.content.items.map((item, index) => (
                            <div key={index} className="flex items-start">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0 ${
                                  assessment.type === 'excellent'
                                    ? 'bg-success text-white'
                                    : 'bg-warning text-white'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <p className="text-sm text-base-content/80 leading-relaxed">
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action suggestion */}
                    <div className="mt-6 p-3 bg-base-200 rounded-lg">
                      <p className="text-sm text-base-content/70">
                        {assessment.type === 'excellent'
                          ? '🎉 Your prompt is ready! You can now proceed to select reference files for better context.'
                          : '💡 Consider updating your prompt with the suggestions above for better results.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1PromptRefinement
