// src/pages/_app.tsx
import '@/shared/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '../shared/store'
import { Manrope } from 'next/font/google'
import Layout from '@/shared/components/Layout'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope'
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <div className={`${manrope.variable} font-manrope`}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </Provider>
  )
}
