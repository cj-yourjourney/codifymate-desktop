// src/pages/_app.tsx
import '@/shared/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '../shared/store'
import Layout from '@/shared/components/Layout'
import { AuthProvider } from '@/shared/components/AuthContext'
import { useEffect, useState } from 'react'

// Import pages for hash routing
import AiCodeAssistant from './ai-code-assistant'
// import PaymentPage from './payment'  <-- Uncomment when you create the Payment page

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
  // Example placeholder for future Payment page
  // else if (currentPage === 'payment') {
  //   RenderedComponent = PaymentPage
  // }

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
