// src/pages/_app.tsx
import '@/shared/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '../shared/store'
import Layout from '@/shared/components/Layout'
import { AuthProvider } from '@/shared/components/AuthContext'
import { useEffect, useState } from 'react'

// Import the page you want to render for hash route
import AiCodeAssistant from './ai-code-assistant'

export default function App({ Component, pageProps }: AppProps) {
  const [currentPage, setCurrentPage] = useState<string>('signin')

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace('#/', '')
      setCurrentPage(hash || 'signin')
    }

    window.addEventListener('hashchange', checkHash)
    checkHash() // run on mount

    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Decide which page to render based on hash
  let RenderedComponent = Component
  if (currentPage === 'ai-code-assistant') {
    RenderedComponent = AiCodeAssistant
  }

  return (
    <Provider store={store}>
      <div className="font-manrope">
        <AuthProvider>
          <Layout>
            <RenderedComponent {...pageProps} />
          </Layout>
        </AuthProvider>
      </div>
    </Provider>
  )
}
