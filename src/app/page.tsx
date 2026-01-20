'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ChatInterface from '@/components/ChatInterface'
import ImageGenerator from '@/components/ImageGenerator'
import TextToSpeech from '@/components/TextToSpeech'
import Translation from '@/components/Translation'
import UserMenu from '@/components/UserMenu'

export default function Home() {
  const { user, isLoading, login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<'chat' | 'images' | 'tts' | 'translate'>('chat')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      if (authMode === 'login') {
        await login(email, password)
      } else {
        if (!username.trim()) {
          setAuthError('Username is required')
          setAuthLoading(false)
          return
        }
        await register(email, username, password)
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">
            🤖 Bilingual Education Platform
          </h1>
          <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
            Self-hosted AI services for English-Polish education. Chat, translate, generate images, and create natural speech.
          </p>
          {user && user.username && (
            <div className="flex justify-center mt-4">
              <UserMenu />
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex justify-center flex-wrap gap-3 text-sm mb-8">
          <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-medium">
            ✅ Ollama Chat
          </span>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
            🎨 Stable Diffusion
          </span>
          <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium">
            🔊 XTTS Neural TTS
          </span>
          <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-medium">
            🌍 LibreTranslate
          </span>
          {user && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
              🔐 Authenticated
            </span>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 border border-slate-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              💬 Chat AI
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'images'
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              🎨 Image Generation
            </button>
            <button
              onClick={() => setActiveTab('tts')}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'tts'
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              🔊 Text-to-Speech
            </button>
            <button
              onClick={() => setActiveTab('translate')}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'translate'
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              🌍 Translate
            </button>
          </div>
        </div>

        {/* Service Content */}
        <div className="max-w-4xl mx-auto">
          {user ? (
            <>
              {activeTab === 'chat' && <ChatInterface />}
              {activeTab === 'images' && <ImageGenerator />}
              {activeTab === 'tts' && <TextToSpeech />}
              {activeTab === 'translate' && <Translation />}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200 max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600">
                    {authMode === 'login'
                      ? 'Sign in to access the bilingual education AI platform'
                      : 'Create an account to get started'
                    }
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Choose a username"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  {authError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-800 text-sm">{authError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                      </>
                    ) : (
                      authMode === 'login' ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login')
                      setAuthError(null)
                      setEmail('')
                      setUsername('')
                      setPassword('')
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {authMode === 'login'
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>

                <div className="mt-6 p-3 bg-blue-50 rounded-md">
                  <p className="text-blue-800 text-sm text-center">
                    <strong>Demo:</strong> admin@example.com / admin123
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}