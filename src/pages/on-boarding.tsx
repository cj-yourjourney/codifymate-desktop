// pages/on-boarding.tsx
import React from 'react'
import Head from 'next/head'
import { OnboardingComponent } from '@/features/onBoarding'

const OnboardingPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>AI Code Assistant - Onboarding</title>
        <meta
          name="description"
          content="Learn how to use the AI Code Assistant in 3 simple steps"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <OnboardingComponent />
    </>
  )
}

export default OnboardingPage
