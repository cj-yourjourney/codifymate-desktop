// pages/sign-up.tsx
import Head from 'next/head'
import SignUpForm from '@/features/auth/SignUpForm'
import type { NextPage } from 'next'

const SignUpPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sign Up - AI Code Assistant</title>
        <meta
          name="description"
          content="Create your AI Code Assistant account"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <SignUpForm />
      </main>
    </>
  )
}

export default SignUpPage
