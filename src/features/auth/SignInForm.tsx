// components/SignInForm.tsx (updated with Redux)
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  signIn,
  selectIsLoading,
  selectSignInError,
  selectIsAuthenticated,
  clearError,
  clearFieldError
} from './state/signinSlice' // Updated import path

interface SignInUserData {
  username: string // Changed from email to username to match API
  password: string
}

interface ValidationErrors {
  username?: string
  password?: string
}

const SignInForm: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Redux state
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectSignInError)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // Local form state
  const [formData, setFormData] = useState<SignInUserData>({
    username: '',
    password: ''
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Redirect to dashboard if authenticated
  useEffect(() => {
    // if (isAuthenticated) {
    //   router.push('/dashboard')
    // }
  }, [isAuthenticated, router])

  // Clear general errors when component unmounts or when starting a new sign in
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }

    // Clear Redux field error when user starts typing
    if (error && error[name as keyof typeof error]) {
      dispatch(clearFieldError(name as 'username' | 'password'))
    }
  }

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    return errors
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Clear previous errors
    dispatch(clearError())
    setValidationErrors({})

    // Dispatch sign in action
    const result = await dispatch(signIn(formData))

    // Handle the result if needed for additional UI feedback
    if (signIn.fulfilled.match(result)) {
      console.log('Sign in successful')
      // Navigation will happen automatically via useEffect
    } else if (signIn.rejected.match(result)) {
      console.log('Sign in failed:', result.payload)
    }
  }

  const renderFieldError = (fieldName: keyof ValidationErrors) => {
    const validationError = validationErrors[fieldName]

    // Handle API error format - errors can be arrays or strings
    let serverError: string | null = null
    if (error && error[fieldName]) {
      if (Array.isArray(error[fieldName])) {
        serverError = (error[fieldName] as string[])[0]
      } else {
        serverError = error[fieldName] as string
      }
    }

    const errorMessage = validationError || serverError

    if (errorMessage) {
      return (
        <label className="label">
          <span className="label-text-alt text-error">{errorMessage}</span>
        </label>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center mb-6 w-full">
            Sign In
          </h2>

          {/* Display general API errors */}
          {error && (error.message || error.error || error.detail) && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="h-6 w-6 stroke-current shrink-0" />
              <span>{error.message || error.error || error.detail}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className={`input input-bordered w-full ${
                  validationErrors.username || (error && error.username)
                    ? 'input-error'
                    : ''
                }`}
                disabled={isLoading}
              />
              {renderFieldError('username')}
            </div>

            <div className="form-control">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`input input-bordered w-full ${
                  validationErrors.password || (error && error.password)
                    ? 'input-error'
                    : ''
                }`}
                disabled={isLoading}
              />
              {renderFieldError('password')}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  isLoading ? 'loading' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/sign-up')}
                className="link link-primary"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInForm
