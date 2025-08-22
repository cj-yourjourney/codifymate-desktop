// pages/signin.tsx
import { NextPage } from 'next'
import Head from 'next/head'
import SignInForm from '@/features/auth/SignInForm'

const SignInPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sign In - Your App Name</title>
        <meta name="description" content="Sign in to your account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SignInForm />
    </>
  )
}

export default SignInPage
