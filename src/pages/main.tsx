import React, { useState } from 'react'
import {
  Step1PromptRefinement,
  Step2PromptClarification,
  Step3CodeGeneration
} from '@/features/aiCodeAssistant/steps'


interface Question {
  id: string
  question: string
  answer: string
}

interface FileReference {
  path: string
  relevant: boolean
}

interface CodeResponse {
  explanation: string
  code: string
  language: string
}

const AICodeAssistant: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState<string>('')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [fileReferences, setFileReferences] = useState<FileReference[]>([])
  const [codeResponse, setCodeResponse] = useState<CodeResponse | null>(null)
  const [refinePrompt, setRefinePrompt] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<number>(1)

  const stepTitles = [
    'Refine Prompt',
    'Clarify & Select Files',
    'Generate & Refine Code'
  ]

  const stepColors = ['primary', 'success', 'secondary']

  // Placeholder Data (mocked for now)
  const placeholderQuestions: Question[] = [
    {
      id: '1',
      question: 'What specific functionality should this component handle?',
      answer: 'User authentication and session management'
    },
    {
      id: '2',
      question: 'Should this integrate with any existing APIs?',
      answer: 'Yes, integrate with our REST API for user data'
    },
    {
      id: '3',
      question: 'What styling framework are you using?',
      answer: 'Tailwind CSS'
    }
  ]

  const placeholderFiles: FileReference[] = [
    { path: '/src/components/auth/LoginForm.tsx', relevant: true },
    { path: '/src/lib/api.ts', relevant: true },
    { path: '/src/types/user.ts', relevant: true },
    { path: '/src/styles/globals.css', relevant: false },
    { path: '/src/utils/validation.ts', relevant: true }
  ]

  const placeholderCodeResponse: CodeResponse = {
    explanation:
      "I've created a comprehensive authentication component that handles user login with form validation, API integration, and proper error handling. The component uses React hooks for state management and includes TypeScript interfaces for type safety.",
    code: `import React, { useState } from 'react';
import { User, LoginCredentials } from '../types/user';
import { api } from '../lib/api';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onError: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onError }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const user = await api.login(credentials);
      onLogin(user);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          required
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          required
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="btn btn-primary w-full"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </div>
  );
};`,
    language: 'typescript'
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      if (currentStep === 1) {
        setQuestions(placeholderQuestions)
        setFileReferences(placeholderFiles)
      }
      if (currentStep === 2) {
        setCodeResponse(placeholderCodeResponse)
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    setCurrentStep(step)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PromptRefinement
            userPrompt={userPrompt}
            selectedFolder={selectedFolder}
            setUserPrompt={setUserPrompt}
            setSelectedFolder={setSelectedFolder}
          />
        )
      case 2:
        return (
          <Step2PromptClarification
            questions={questions}
            fileReferences={fileReferences}
          />
        )
      case 3:
        return (
          <Step3CodeGeneration
            codeResponse={codeResponse}
            refinePrompt={refinePrompt}
            setRefinePrompt={setRefinePrompt}
          />
        )
      default:
        return null
    }
  }

  const getStepButtonText = () => {
    switch (currentStep) {
      case 1:
        return '📤 Analyze Project & Generate Questions'
      case 2:
        return '🚀 Generate Code'
      case 3:
        return '✨ Continue Refining'
      default:
        return 'Continue'
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">AI Code Assistant</h1>
          <p className="text-base-content/70">
            Generate, refine, and improve your code with AI assistance
          </p>
        </div>

        <div className="mb-8">
          <ul className="steps w-full">
            {stepTitles.map((title, index) => (
              <li
                key={index + 1}
                className={`step ${
                  currentStep >= index + 1 ? `step-${stepColors[index]}` : ''
                } cursor-pointer`}
                onClick={() => handleStepClick(index + 1)}
              >
                {title}
              </li>
            ))}
          </ul>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center mb-6">
              <div
                className={`badge badge-${
                  stepColors[currentStep - 1]
                } badge-lg mr-3`}
              >
                {currentStep}
              </div>
              <h2 className="card-title text-2xl">
                {stepTitles[currentStep - 1]}
              </h2>
            </div>

            <div className="mb-8">{renderStepContent()}</div>

            <div className="flex justify-between items-center">
              <button
                className="btn btn-outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {stepTitles.map((_, index) => (
                  <button
                    key={index}
                    className={`btn btn-xs ${
                      currentStep === index + 1
                        ? `btn-${stepColors[index]}`
                        : 'btn-outline'
                    }`}
                    onClick={() => handleStepClick(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className={`btn btn-${stepColors[currentStep - 1]}`}
                onClick={currentStep === 3 ? undefined : handleNextStep}
                disabled={currentStep === 3 && !refinePrompt.trim()}
              >
                {currentStep === 3
                  ? getStepButtonText()
                  : `${getStepButtonText()} →`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICodeAssistant
