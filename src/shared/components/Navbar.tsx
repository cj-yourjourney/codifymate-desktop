// src/components/layout/Navbar.tsx
import React from 'react'
import { useAuth } from './AuthContext'
import { navigateTo, ROUTES } from '@/shared/components/HashRouter'

const Navbar: React.FC = () => {
  const { user, loading, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // Navigate to sign-in page after logout
      navigateTo(ROUTES.SIGNIN)
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
        {/* Empty center section - credits removed */}
      </div>
      <div className="navbar-end">
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm">Loading...</span>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            {/* Username dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="text-sm font-medium text-primary underline hover:text-primary/80 cursor-pointer transition-colors duration-200"
              >
                {user.username}
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-40"
              >
                <li>
                  <a onClick={handleLogout} className="text-error">
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Navbar
