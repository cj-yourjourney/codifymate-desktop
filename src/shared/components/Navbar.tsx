// src/components/layout/Navbar.tsx
import React from 'react'

const Navbar: React.FC = () => {
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
        {/* Add right-side items here if needed (e.g., user menu, settings) */}
      </div>
    </div>
  )
}

export default Navbar
