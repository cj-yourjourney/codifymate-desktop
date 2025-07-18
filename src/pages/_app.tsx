import type { AppProps } from 'next/app'
import '@/styles/globals.css'

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>
    }
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
