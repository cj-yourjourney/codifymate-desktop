// components/SignUpForm.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import {
  registerUser,
  clearSignupError,
  clearSignupState
} from './state/signupSlice'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import type { RegisterUserData } from './state/signupSlice'
import { tokenStorage } from '@/shared/utils/tokenStorage'


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
      // Redirect to login or dashboard after successful registration
      // router.push('/login')
      // Call this to see tokens
      tokenStorage.debugTokens()
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

    dispatch(registerUser(formData))
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
          <h2 className="card-title text-2xl font-bold text-center mb-6">
            Create Account
          </h2>

          {/* Display general API errors */}
          {error && (error.message || error.error) && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error.message || error.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
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
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
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
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                placeholder="Confirm your password"
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
              <label className="label">
                <span className="label-text">Invite Code</span>
              </label>
              <input
                type="text"
                name="invite_code"
                value={formData.invite_code}
                onChange={handleChange}
                placeholder="Enter your invite code"
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
                onClick={() => router.push('/login')}
                className="link link-primary"
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
