// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import  counterReducer  from './counterSlice'
import { composeWithDevTools } from '@redux-devtools/remote'

// Configure remote DevTools
const composeEnhancers = composeWithDevTools({
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


export const store = configureStore({
  reducer: {
    counter: counterReducer
  },
  devTools: false,
  enhancers: (getDefaultEnhancers) =>
    process.env.NODE_ENV !== 'production'
      ? getDefaultEnhancers().concat(composeEnhancers())
      : getDefaultEnhancers()
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
