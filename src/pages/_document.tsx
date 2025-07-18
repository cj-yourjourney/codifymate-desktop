import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Electron Desktop App" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
