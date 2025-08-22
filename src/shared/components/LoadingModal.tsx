import React, { useState, useEffect } from 'react'

interface LoadingModalProps {
  isOpen: boolean
  title: string
  message: string
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title,
  message
}) => {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isOpen) {
      // Reset timer when modal opens
      setElapsedTime(0)

      // Start the timer
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1)
      }, 1000)
    } else {
      // Reset timer when modal closes
      setElapsedTime(0)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isOpen])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress based on elapsed time (simulate progress over time)
  // Progress increases more slowly after initial period to avoid reaching 100%
  const calculateProgress = (seconds: number): number => {
    if (seconds <= 10) {
      return (seconds / 10) * 30 // 0-30% in first 10 seconds
    } else if (seconds <= 30) {
      return 30 + ((seconds - 10) / 20) * 40 // 30-70% in next 20 seconds
    } else {
      return Math.min(70 + ((seconds - 30) / 60) * 25, 95) // 70-95% afterwards
    }
  }

  const progress = calculateProgress(elapsedTime)

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="text-center">
          {/* Loading Spinner */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-base-content mb-2">{title}</h3>

          {/* Message */}
          <p className="text-base-content/70 mb-6">{message}</p>

          {/* Timer */}
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-2 text-primary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-lg font-semibold">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-base-content/60 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <progress
              className="progress progress-primary w-full h-3"
              value={progress}
              max="100"
            ></progress>
          </div>

          {/* Simple loading indicator */}
          <div className="flex justify-center space-x-1 mt-4">
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
