// components/SignUpForm.tsx (updated with AuthContext refresh)
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  registerUser,
  clearSignupError,
  clearSignupState
} from './state/signupSlice'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import { useAuth } from '@/shared/components/AuthContext' // Add this import
import { navigateTo, ROUTES } from '@/shared/components/HashRouter'
import type { RegisterUserData } from './state/signupSlice'

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  password2?: string
  invite_code?: string
}

const SignUpForm: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { refreshUser } = useAuth() // Add this to refresh AuthContext

  const { isLoading, error, isRegistered } = useAppSelector(
    (state) => state.signup
  )

  const [formData, setFormData] = useState<RegisterUserData>({
    username: '',
    email: '',
    password: '',
    password2: '',
    invite_code: ''
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (isRegistered) {
      // Navigate to AI assistant after successful registration
      navigateTo(ROUTES.AI_CODE_ASSISTANT)
      console.log('Registration successful! Tokens stored in secure storage.')
    }
  }, [isRegistered, router])

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearSignupError())
    dispatch(clearSignupState())
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
  }

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!formData.password2) {
      errors.password2 = 'Please confirm your password'
    } else if (formData.password !== formData.password2) {
      errors.password2 = 'Passwords do not match'
    }

    if (!formData.invite_code.trim()) {
      errors.invite_code = 'Invite code is required'
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
    dispatch(clearSignupError())
    setValidationErrors({})

    // Dispatch registration action
    const result = await dispatch(registerUser(formData))

    // Handle the result
    if (registerUser.fulfilled.match(result)) {
      console.log('Registration successful')
      // Refresh the AuthContext to update the Navbar
      await refreshUser()
      // Navigation will happen automatically via useEffect
    } else if (registerUser.rejected.match(result)) {
      console.log('Registration failed:', result.payload)
    }
  }

  const renderFieldError = (fieldName: keyof ValidationErrors) => {
    const validationError = validationErrors[fieldName]

    // Handle Django API error format - errors can be arrays or strings
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
            Create Account
          </h2>

          {/* Display general API errors */}
          {error && (error.message || error.error) && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="h-6 w-6 stroke-current shrink-0" />
              <span>{error.message || error.error}</span>
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
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`input input-bordered w-full ${
                  validationErrors.email || (error && error.email)
                    ? 'input-error'
                    : ''
                }`}
                disabled={isLoading}
              />
              {renderFieldError('email')}
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

            <div className="form-control">
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`input input-bordered w-full ${
                  validationErrors.password2 || (error && error.password2)
                    ? 'input-error'
                    : ''
                }`}
                disabled={isLoading}
              />
              {renderFieldError('password2')}
            </div>

            <div className="form-control">
              <input
                type="text"
                name="invite_code"
                value={formData.invite_code}
                onChange={handleChange}
                placeholder="Invitation Code"
                className={`input input-bordered w-full ${
                  validationErrors.invite_code || (error && error.invite_code)
                    ? 'input-error'
                    : ''
                }`}
                disabled={isLoading}
              />
              {renderFieldError('invite_code')}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  isLoading ? 'loading' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/sign-in')}
                className="link link-primary"
                disabled={isLoading}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpForm
