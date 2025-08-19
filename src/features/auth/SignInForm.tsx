// components/SignInForm.tsx
import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'

interface SignInUserData {
  email: string
  password: string
}

interface ValidationErrors {
  email?: string
  password?: string
}

const SignInForm: React.FC = () => {
  const router = useRouter()

  // Mock loading state for UI testing
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const [formData, setFormData] = useState<SignInUserData>({
    email: '',
    password: ''
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

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

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
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

    // Mock login process for UI testing
    setIsLoading(true)
    setError(null)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log('Sign in attempt with:', formData)
      // You can uncomment this to test success flow
      // router.push('/dashboard')
    }, 2000)
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
            Sign In
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
