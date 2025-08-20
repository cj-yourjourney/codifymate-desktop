// src/components/layout/Navbar.tsx
import React from 'react'
import { useAuth } from './AuthContext'

const Navbar: React.FC = () => {
  const { user, loading, error, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // You might want to redirect to login page here
      console.log('User logged out successfully')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl font-bold font-manrope">
          CodifyMate
        </a>
      </div>
      <div className="navbar-center">
        {/* Add navigation items here if needed */}
      </div>
      <div className="navbar-end">
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2">
            <span className="text-error text-sm">Auth Error</span>
          </div>
        ) : user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-content font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <div className="justify-between">
                  <span className="font-semibold">{user.username}</span>
                </div>
              </li>
              <li>
                <a className="text-sm text-base-content/70">{user.email}</a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a onClick={handleLogout} className="text-error">
                  Logout
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">Not logged in</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
