'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AccountModal from './AccountModal'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [accountModal, setAccountModal] = useState<{
    isOpen: boolean
    mode: 'change-password' | 'delete-account'
  }>({
    isOpen: false,
    mode: 'change-password'
  })

  if (!user || !user.username) return null

  const handleChangePassword = () => {
    setIsOpen(false)
    setAccountModal({ isOpen: true, mode: 'change-password' })
  }

  const handleDeleteAccount = () => {
    setIsOpen(false)
    setAccountModal({ isOpen: true, mode: 'delete-account' })
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-700 font-medium">{user.username}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 mt-1 capitalize">{user.role}</p>
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Change Password
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete Account
            </button>

            <div className="border-t border-gray-100 mt-1">
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      <AccountModal
        isOpen={accountModal.isOpen}
        onClose={() => setAccountModal({ ...accountModal, isOpen: false })}
        mode={accountModal.mode}
      />
    </>
  )
}