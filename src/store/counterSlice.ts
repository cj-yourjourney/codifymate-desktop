// src/store/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  value: number
  title: string
}

const initialState: CounterState = {
  value: 0,
  title: 'Simple Counter'
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
    reset: (state) => {
      state.value = 0
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount, reset, setTitle } =
  counterSlice.actions

export default counterSlice.reducer
