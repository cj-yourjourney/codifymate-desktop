import React, { useState, useEffect } from 'react'
import {
  Edit3,
  HelpCircle,
  Code,
  Check,
  BarChart3,
  FileText,
  FolderOpen,
  Plus,
  X,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  Lightbulb,
  PlayCircle,
  SkipForward
} from 'lucide-react'

const OnboardingComponent = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showTooltip, setShowTooltip] = useState(true)
  const [userPrompt, setUserPrompt] = useState('')
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessment, setAssessment] = useState(null)
  const [projectPath, setProjectPath] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [expandedFiles, setExpandedFiles] = useState(new Set(['0']))
  const [refinePrompt, setRefinePrompt] = useState('')
  const [currentAnimation, setCurrentAnimation] = useState(0)

  const steps = [
    { id: 1, title: 'Prompt', icon: Edit3 },
    { id: 2, title: 'Files', icon: HelpCircle },
    { id: 3, title: 'Code', icon: Code }
  ]

  // Mock data
  const mockAssessment = {
    score: 8,
    category: 'UI Component',
    content: {
      title: 'Well-defined UI Component Request',
      items: [
        'Clear feature specification: login page with form validation',
        'Good technical details: mentions React, form handling',
        'Could specify styling preferences (CSS/styled-components)',
        'Consider mentioning authentication method'
      ]
    }
  }

  const mockFiles = [
    'src/components/auth/LoginForm.tsx',
    'src/pages/auth/login.tsx',
    'src/styles/auth.css',
    'src/utils/validation.ts',
    'src/hooks/useAuth.ts'
  ]

  const mockGeneratedCode = {
    explanation:
      'Created a complete login page with form validation, responsive design, and proper TypeScript types. Includes error handling and loading states.',
    files_to_modify: [
      {
        file_path: 'src/components/auth/LoginForm.tsx',
        change_type: 'create',
        code: `import React, { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  loading?: boolean
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  loading = false 
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\\S+@\\S+\\.\\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      await onSubmit(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 pr-10"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3"
          >
            {showPassword ? 
              <EyeOff className="w-4 h-4" /> : 
              <Eye className="w-4 h-4" />
            }
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md 
                 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                 flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}`
      },
      {
        file_path: 'src/pages/auth/login.tsx',
        change_type: 'create',
        code: `import React from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

const LoginPage = () => {
  const { login, loading } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      // Redirect to dashboard or home page
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm onSubmit={handleLogin} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default LoginPage`
      }
    ]
  }

  const tooltips = {
    1: {
      title: 'Write a Specific Feature Request',
      content:
        "Be precise! Instead of 'build an app', try 'create a login page with email validation'. Specific requests get better results.",
      example:
        "Try typing: 'Create a login page with email and password fields, form validation, and responsive design'"
    },
    2: {
      title: 'Select Your Project Folder',
      content:
        'Choose where to implement your feature. AI will analyze your codebase and suggest relevant files to modify or create.',
      example:
        'Select a Next.js or React project folder. AI will understand your project structure and suggest the right files.'
    },
    3: {
      title: 'Review & Refine Generated Code',
      content:
        "Copy the generated code or download files. Use the refinement panel to request improvements like 'add dark mode' or 'use TypeScript'.",
      example:
        "Try refining: 'Add a forgot password link' or 'Use Tailwind CSS instead of regular CSS'"
    }
  }

  // Simulate step progression for demo
  useEffect(() => {
    if (currentStep === 1 && userPrompt && currentAnimation === 1) {
      const timer = setTimeout(() => {
        setIsAssessing(true)
        setTimeout(() => {
          setIsAssessing(false)
          setAssessment(mockAssessment)
        }, 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [userPrompt, currentAnimation])

  const handleDemoPrompt = () => {
    setUserPrompt(
      'Create a login page with email and password fields, form validation, and responsive design using React and TypeScript'
    )
    setCurrentAnimation(1)
  }

  const handleDemoFolder = () => {
    setProjectPath('/Users/john/projects/my-nextjs-app')
    setSelectedFiles(mockFiles.slice(0, 3))
  }

  const getStepStatus = (stepId) => {
    if (currentStep === stepId) return 'active'
    if (currentStep > stepId) return 'completed'
    return 'available'
  }

  const renderTooltip = () => {
    if (!showTooltip) return null

    const tooltip = tooltips[currentStep]
    return (
      <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4" />
            <h4 className="font-medium text-sm">{tooltip.title}</h4>
          </div>
          <button onClick={() => setShowTooltip(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mb-2 text-blue-100">{tooltip.content}</p>
        <p className="text-xs text-blue-200 italic">{tooltip.example}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-blue-200">Step {currentStep} of 3</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-xs bg-white/20 px-2 py-1 rounded"
          >
            Got it
          </button>
        </div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Assessment Result - Show only if assessed */}
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
                onClick={() => {
                  if (userPrompt) {
                    setIsAssessing(true)
                    setTimeout(() => {
                      setIsAssessing(false)
                      setAssessment(mockAssessment)
                    }, 2000)
                  }
                }}
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
                  onClick={() => setCurrentStep(2)}
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

  const renderStep2 = () => {
    if (!projectPath) {
      return (
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-lg border p-8 text-center">
            <FolderOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Select Project</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose your project folder
            </p>
            <button
              onClick={handleDemoFolder}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Select Folder
            </button>

            {/* Demo hint */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Demo:</strong> Click to simulate selecting a Next.js
                project folder
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium">my-nextjs-app</h3>
              <p className="text-sm text-gray-500">127 files</p>
            </div>
            <button
              onClick={() => setProjectPath('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Change
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedFiles(mockFiles)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Analyze
            </button>
            <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <>
              <div className="space-y-1 mb-4">
                {mockFiles.map((path, index) => {
                  const selected = selectedFiles.includes(path)
                  const aiSuggested = index < 3

                  return (
                    <div
                      key={path}
                      onClick={() => {
                        if (selected) {
                          setSelectedFiles(
                            selectedFiles.filter((f) => f !== path)
                          )
                        } else {
                          setSelectedFiles([...selectedFiles, path])
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selected ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span>{aiSuggested ? '⭐' : '📄'}</span>
                        <span className="text-sm truncate">
                          {path.split('/').pop()}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selected && <Check className="w-2 h-2 text-white" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Continue ({selectedFiles.length})
              </button>

              {/* Demo explanation */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>⭐ AI Suggested:</strong> These files are recommended
                  based on your prompt. Toggle files to include in code
                  generation.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Generated Code</h3>
                <p className="text-sm text-gray-500">
                  2 files • 5.2 credits used
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-gray-700">
                {mockGeneratedCode.explanation}
              </p>
            </div>

            <div className="space-y-2">
              {mockGeneratedCode.files_to_modify.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      const newExpanded = new Set(expandedFiles)
                      const key = index.toString()
                      if (newExpanded.has(key)) {
                        newExpanded.delete(key)
                      } else {
                        newExpanded.add(key)
                      }
                      setExpandedFiles(newExpanded)
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {expandedFiles.has(index.toString()) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="text-sm truncate">
                        {file.file_path.split('/').pop()}
                      </span>
                      <span className="px-1 py-0.5 text-xs rounded bg-green-100 text-green-700">
                        {file.change_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Copy className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {expandedFiles.has(index.toString()) && (
                    <div className="border-t border-gray-200 p-3">
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto">
                        <code>{file.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4 sticky top-6">
            <h3 className="font-medium text-gray-900 mb-3">Refine Code</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refinement Instructions
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Describe improvements you'd like..."
                  value={refinePrompt}
                  onChange={(e) =>
                    setRefinePrompt(e.target.value.slice(0, 500))
                  }
                />
                <div className="text-xs text-gray-500 mt-1">
                  {refinePrompt.length}/500 characters
                </div>
              </div>

              <button
                disabled={!refinePrompt.trim()}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Refine Code
              </button>

              {/* Demo suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Try these:</p>
                {[
                  'Add a forgot password link',
                  'Use Tailwind CSS styling',
                  'Add loading animation'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setRefinePrompt(suggestion)}
                    className="w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Files:</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span>Credits left:</span>
                <span>24.8</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens:</span>
                <span>2,847</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {renderTooltip()}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Code Assistant
              </h1>
              <p className="text-sm text-gray-600">
                Learn how to use the assistant in 3 simple steps
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTooltip(true)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1"
              >
                <Lightbulb className="w-3 h-3" />
                <span>Show Tips</span>
              </button>
              <button
                onClick={() =>
                  setCurrentStep(currentStep < 3 ? currentStep + 1 : 1)
                }
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center space-x-1"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center space-x-6">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              const Icon = step.icon

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                      status === 'active'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        status === 'completed'
                          ? 'bg-green-500 text-white'
                          : status === 'active'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {status === 'completed' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon className="w-3 h-3" />
                      <span className="text-xs">{step.title}</span>
                    </div>
                  </button>

                  {index < steps.length - 1 && (
                    <div className="mx-3">
                      <div
                        className={`w-6 h-0.5 ${
                          currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-6">{renderStep()}</div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  step.id === currentStep
                    ? 'bg-blue-500'
                    : step.id < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep(currentStep + 1)
              } else {
                // Reset to beginning or show completion message
                setCurrentStep(1)
                setUserPrompt('')
                setAssessment(null)
                setProjectPath('')
                setSelectedFiles([])
                setRefinePrompt('')
                setExpandedFiles(new Set(['0']))
                setCurrentAnimation(0)
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-1"
          >
            <span>{currentStep === 3 ? 'Start Over' : 'Next'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Completion Message */}
      {currentStep === 3 && (
        <div className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-40">
          <div className="flex items-center space-x-2 mb-2">
            <Check className="w-4 h-4" />
            <h4 className="font-medium text-sm">Tutorial Complete!</h4>
          </div>
          <p className="text-xs text-green-100">
            You've learned how to use the AI Code Assistant. Ready to build your
            own features?
          </p>
        </div>
      )}
    </div>
  )
}

export default OnboardingComponent
