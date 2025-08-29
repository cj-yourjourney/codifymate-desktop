// src/shared/store/index.ts
import { configureStore } from '@reduxjs/toolkit'

import { composeWithDevTools } from '@redux-devtools/remote'

import signupReducer from '@/features/auth/state/signupSlice'
import signinReducer from '@/features/auth/state/signinSlice'

import promptAssessmentReducer from '@/features/aiCodeAssistant/promptRefinement/state/promptAssessmentSlice'
import relevantFilesReducer from '@/features/aiCodeAssistant/relevantFiles/state/relevantFilesSlice'
import codeGenerationReducer from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Configure remote DevTools only in development
const composeEnhancers = isDevelopment
  ? composeWithDevTools({
      realtime: true,
      name: 'Electron File Manager',
      hostname: 'localhost',
      port: 9000,
      suppressConnectErrors: false,
      secure: false,
      maxAge: 30,
      trace: true,
      traceLimit: 25
    })
  : undefined

// Create store with conditional configuration
export const store = configureStore({
  reducer: {
    signup: signupReducer,
    signin: signinReducer,

    promptAssessment: promptAssessmentReducer,
    relevantFiles: relevantFilesReducer,
    codeGeneration: codeGenerationReducer, // Add this line
  },
  devTools: false,
  // Use enhancers callback function for Redux Toolkit compatibility
  enhancers: (getDefaultEnhancers) =>
    process.env.NODE_ENV !== 'production'
      ? getDefaultEnhancers().concat(composeEnhancers())
      : getDefaultEnhancers()
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
