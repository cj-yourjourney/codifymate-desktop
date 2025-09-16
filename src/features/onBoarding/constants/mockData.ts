// constants/mockData.ts
import { MockAssessment, MockGeneratedCode } from '../types/onboarding'

export const mockAssessment: MockAssessment = {
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

export const mockFiles = [
  'src/components/auth/LoginForm.tsx',
  'src/pages/auth/login.tsx',
  'src/styles/auth.css',
  'src/utils/validation.ts',
  'src/hooks/useAuth.ts'
]

export const mockGeneratedCode: MockGeneratedCode = {
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

export const tooltips = {
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
