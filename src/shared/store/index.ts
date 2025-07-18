// src/shared/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import { composeWithDevTools } from '@redux-devtools/remote'

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
export const store =
  isDevelopment && composeEnhancers
    ? configureStore({
        reducer: {
          counter: counterReducer
        },
        devTools: false,
        // @ts-expect-error - Ignore TypeScript error for enhancers
        enhancers: [composeEnhancers]
      })
    : configureStore({
        reducer: {
          counter: counterReducer
        },
        devTools: false
      })

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
