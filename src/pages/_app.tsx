// src/pages/_app.tsx
import '@/shared/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '../shared/store'
import Layout from '@/shared/components/Layout'
import { AuthProvider } from '@/shared/components/AuthContext'
import HashRouter from '@/shared/components/HashRouter'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <div className="font-manrope">
        <AuthProvider>
          <Layout>
            <HashRouter fallbackComponent={Component} />
          </Layout>
        </AuthProvider>
      </div>
    </Provider>
  )
}
