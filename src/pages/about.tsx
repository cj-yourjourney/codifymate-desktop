// src/pages/about.tsx
import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
  setTitle
} from '../shared/store/counterSlice'
import { useState } from 'react'

export default function About() {
  const count = useAppSelector((state) => state.counter.value)
  const title = useAppSelector((state) => state.counter.title)
  const dispatch = useAppDispatch()
  const [customAmount, setCustomAmount] = useState<string>('')
  const [newTitle, setNewTitle] = useState<string>('')

  const handleIncrementByAmount = () => {
    const amount = parseInt(customAmount)
    if (!isNaN(amount)) {
      dispatch(incrementByAmount(amount))
      setCustomAmount('')
    }
  }

  const handleSetTitle = () => {
    if (newTitle.trim()) {
      dispatch(setTitle(newTitle.trim()))
      setNewTitle('')
    }
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          About This App
        </h1>

        {/* Redux Counter Demo */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Redux Counter Demo</h2>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <div className="text-6xl font-bold text-primary mb-4">
                {count}
              </div>

              <div className="flex gap-3 justify-center mb-4">
                <button
                  className="btn btn-error"
                  onClick={() => dispatch(decrement())}
                >
                  -1
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => dispatch(reset())}
                >
                  Reset
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => dispatch(increment())}
                >
                  +1
                </button>
              </div>

              <div className="flex gap-2 justify-center mb-4">
                <input
                  type="number"
                  placeholder="Custom amount"
                  className="input input-bordered w-32"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <button
                  className="btn btn-info"
                  onClick={handleIncrementByAmount}
                >
                  Add
                </button>
              </div>

              <div className="flex gap-2 justify-center">
                <input
                  type="text"
                  placeholder="New title"
                  className="input input-bordered"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={handleSetTitle}>
                  Set Title
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Technology Stack</h2>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <span className="badge badge-primary w-2 h-2 p-0"></span>
                <span>Next.js with Pages Router</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="badge badge-success w-2 h-2 p-0"></span>
                <span>TypeScript</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="badge badge-secondary w-2 h-2 p-0"></span>
                <span>Electron</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="badge badge-info w-2 h-2 p-0"></span>
                <span>TailwindCSS</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="badge badge-warning w-2 h-2 p-0"></span>
                <span>Redux Toolkit</span>
              </li>
            </ul>

            <div className="flex gap-4">
              <Link href="/" className="btn btn-primary">
                Back to Home
              </Link>
              <Link href="/settings" className="btn btn-success">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
