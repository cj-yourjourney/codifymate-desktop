import React, { useState } from 'react'
import {
  Code,
  RefreshCw,
  Copy,
  Download,
  
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Clock,
  Sparkles,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

// Mock data for demonstration
const mockVersions = [
  {
    id: 'v3',
    version: 'Version 3',
    timestamp: '2024-08-22T14:30:00Z',
    refinement_prompt: 'Add proper error handling and loading states',
    explanation:
      'Enhanced the login component with comprehensive error handling, loading states, and improved user feedback. Added proper form validation and responsive design improvements.',
    files_to_modify: [
      {
        file_path: '/src/components/LoginPage.jsx',
        change_type: 'modify',
        code: `import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage`
      }
    ],
    additional_notes:
      'The component now includes proper loading states, error handling, and maintains the red button styling as requested. Consider adding form validation feedback and accessibility improvements.'
  },
  {
    id: 'v2',
    version: 'Version 2',
    timestamp: '2024-08-22T14:15:00Z',
    refinement_prompt:
      'Make the button styling more modern and add hover effects',
    explanation:
      'Updated the login button with modern styling, hover effects, and improved visual hierarchy. The button now uses a red background with smooth transitions.',
    files_to_modify: [
      {
        file_path: '/src/components/LoginPage.jsx',
        change_type: 'modify',
        code: `import React, { useState } from 'react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage`
      }
    ],
    additional_notes:
      'Added smooth hover transitions and improved button styling. The red background is now more vibrant with proper hover states.'
  },
  {
    id: 'v1',
    version: 'Version 1',
    timestamp: '2024-08-22T14:00:00Z',
    refinement_prompt: null,
    explanation:
      'Initial implementation of the LoginPage component with basic form structure and red button styling as requested.',
    files_to_modify: [
      {
        file_path: '/src/components/LoginPage.jsx',
        change_type: 'create',
        code: `import React, { useState } from 'react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-md"
          >
            Sign In
          </button>
        </div>sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-500 text-white rounded-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage`
      }
    ],
    additional_notes:
      'Basic login form with red button styling. Ready for further customization and enhancements.'
  }
]

const Step3CodeGeneration = () => {
  const [currentVersionId, setCurrentVersionId] = useState('v3')
  const [refinePrompt, setRefinePrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState(new Set(['0']))
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const currentVersion =
    mockVersions.find((v) => v.id === currentVersionId) || mockVersions[0]

  const formatTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const handleRefine = async () => {
    if (!refinePrompt.trim()) {
      showNotification('Please enter refinement instructions', 'error')
      return
    }

    setIsRefining(true)

    // Simulate API call
    setTimeout(() => {
      setIsRefining(false)
      setRefinePrompt('')
      showNotification('Code refined successfully!', 'success')
      // In real implementation, this would add a new version
    }, 2000)
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  interface ToggleFileExpanded {
    (index: number): void
  }

  const toggleFileExpanded: ToggleFileExpanded = (index) => {
    const newExpanded: Set<string> = new Set(expandedFiles)
    const key = index.toString()
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedFiles(newExpanded)
  }

  interface ClipboardCopier {
    copy(text: string): Promise<void>
  }

  const copyToClipboard: ClipboardCopier['copy'] = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('Copied to clipboard!', 'success')
    } catch (err: unknown) {
      console.log(err)
      showNotification('Failed to copy', 'error')
    }
  }

  interface GeneratedFile {
    file_path: string
    change_type: string
    code: string
  }

  const downloadFile = (file: GeneratedFile): void => {
    const blob = new Blob([file.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a') as HTMLAnchorElement
    a.href = url
    a.download = file.file_path.split('/').pop() || ''
    a.click()
    URL.revokeObjectURL(url)
    showNotification('File downloaded!', 'success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Code Generation
              </h1>
              <p className="text-gray-600">
                Review, refine, and manage your generated code
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Code Output (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Version Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Version History
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {mockVersions.length} versions
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentVersionId}
                onChange={(e) => setCurrentVersionId(e.target.value)}
              >
                {mockVersions.map((version) => {
                  const { date, time } = formatTimestamp(version.timestamp)
                  return (
                    <option key={version.id} value={version.id}>
                      {version.version} - {date} at {time}
                      {version.refinement_prompt ? ' (Refined)' : ' (Original)'}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* AI Explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-start mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI Explanation
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {currentVersion.explanation}
                  </p>
                </div>
              </div>

              {currentVersion.refinement_prompt && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Last Refinement
                  </h4>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                    {currentVersion.refinement_prompt}
                  </p>
                </div>
              )}

              {currentVersion.additional_notes && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Additional Notes
                  </h4>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                    {currentVersion.additional_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Code Files */}
            <div className="space-y-4">
              {currentVersion.files_to_modify.map((file, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleFileExpanded(index)}
                          className="mr-2 p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          {expandedFiles.has(index.toString()) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <FileText className="w-5 h-5 text-gray-500 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {file.file_path.split('/').pop()}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {file.file_path}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            file.change_type === 'create'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {file.change_type}
                        </span>

                        <button
                          onClick={() => copyToClipboard(file.code)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => downloadFile(file)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedFiles.has(index.toString()) && (
                    <div className="p-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{file.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Refinement Panel (1/3 width) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Refine Code
                  </h3>
                  <p className="text-sm text-gray-600">
                    Improve and customize your code
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refinement Instructions
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={6}
                    placeholder="e.g., Add loading states, improve error handling, optimize performance, add TypeScript types..."
                    value={refinePrompt}
                    onChange={(e) =>
                      setRefinePrompt(e.target.value.slice(0, 500))
                    }
                    disabled={isRefining}
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{refinePrompt.length}/500 characters</span>
                    <span>💡 Be specific for better results</span>
                  </div>
                </div>

                <button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleRefine}
                  disabled={isRefining || !refinePrompt.trim()}
                >
                  {isRefining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Refining...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refine Code
                    </>
                  )}
                </button>

                {refinePrompt && (
                  <button
                    className="w-full text-gray-500 font-medium py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setRefinePrompt('')}
                    disabled={isRefining}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        currentVersion.files_to_modify
                          .map((f) => f.code)
                          .join('\n\n')
                      )
                    }
                    className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Code
                  </button>
                  <button
                    onClick={() => {
                      currentVersion.files_to_modify.forEach((file) =>
                        downloadFile(file)
                      )
                    }}
                    className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All Files
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3CodeGeneration
