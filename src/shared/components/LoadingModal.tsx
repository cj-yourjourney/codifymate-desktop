//  src/shared/components/LoadingModal.tsx
import React from 'react'

interface LoadingModalProps {
  isOpen: boolean
  title: string
  message: string
  progress?: number
  steps?: string[]
  currentStep?: number
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title,
  message,
  progress,
  steps,
  currentStep
}) => {
  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="text-center">
          {/* Loading Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-base-content mb-2">{title}</h3>

          {/* Message */}
          <p className="text-base-content/70 mb-6">{message}</p>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-base-content/60 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={progress}
                max="100"
              ></progress>
            </div>
          )}

          {/* Steps Indicator */}
          {steps && steps.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-base-content/80 mb-3">
                Processing Steps
              </div>
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const isCompleted =
                    currentStep !== undefined && index < currentStep
                  const isCurrent = currentStep === index
                  const isPending =
                    currentStep !== undefined && index > currentStep

                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted
                            ? 'bg-success text-success-content'
                            : isCurrent
                            ? 'bg-primary text-primary-content animate-pulse'
                            : 'bg-base-300 text-base-content/50'
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isCompleted
                            ? 'text-success font-medium'
                            : isCurrent
                            ? 'text-primary font-medium'
                            : 'text-base-content/60'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Loading Dots */}
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop bg-black/20"></div>
    </div>
  )
}

export default LoadingModal
