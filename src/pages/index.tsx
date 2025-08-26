import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [appVersion, setAppVersion] = useState<string>('')
  
  console.log('API BASE URL:', process.env.NEXT_PUBLIC_API_BASE_URL)


  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion)
    }
  }, [])

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          Welcome to Your New Electron App!!! Updated!!!! HERERE!!!!!!!
        </h1>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
           
            <p className="text-base-content">
              Version: {appVersion || 'Loading...'}
            </p>

            <div className="flex flex-col gap-4 mt-4 w-full">
              <Link href="/sign-in" className="btn btn-primary w-full">
                Login
              </Link>
            </div>
            <div className="flex flex-col gap-4 mt-4 w-full">
              <Link href="/sign-up" className="btn btn-primary w-full">
                Sign Up
              </Link>
              </div>
            <div className="flex flex-col gap-4 mt-4 w-full">
              <Link href="/ai-code-assistant" className="btn btn-accent w-full">
                AI Code Assistant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
