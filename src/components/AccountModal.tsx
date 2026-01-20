'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'change-password' | 'delete-account'
}

export default function AccountModal({ isOpen, onClose, mode }: AccountModalProps) {
  const { user, logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] } | null>(null)

  const validatePasswordStrength = async (password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      setPasswordStrength(data)
    } catch (error) {
      console.error('Password validation error:', error)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')!).accessToken : ''}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to change password')
      }

      alert('Password changed successfully!')
      onClose()
      resetForm()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
    )

    if (!confirmed) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')!).accessToken : ''}`,
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete account')
      }

      alert('Account deleted successfully. You will be logged out.')
      logout()
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setDeletePassword('')
    setError(null)
    setPasswordStrength(null)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'change-password' ? 'Change Password' : 'Delete Account'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {mode === 'change-password' ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (e.target.value) validatePasswordStrength(e.target.value)
                }}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {passwordStrength && (
                <div className="mt-1">
                  {passwordStrength.isValid ? (
                    <p className="text-sm text-green-600">✓ Strong password</p>
                  ) : (
                    <ul className="text-sm text-red-600">
                      {passwordStrength.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordStrength?.isValid || newPassword !== confirmPassword}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAccountDeletion} className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600 text-lg">⚠️</span>
                <h3 className="text-red-800 font-semibold">Danger Zone</h3>
              </div>
              <p className="text-red-700 text-sm">
                This action cannot be undone. All your account data, preferences, and history will be permanently deleted.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                placeholder="Enter your password to confirm"
                className="w-full border border-red-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  Deleting Account...
                </>
              ) : (
                'Delete Account Permanently'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}