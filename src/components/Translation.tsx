'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Translation() {
  const { tokens } = useAuth()
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState<'en' | 'pl' | 'auto'>('auto')
  const [targetLang, setTargetLang] = useState<'en' | 'pl'>('pl')
  const [isLoading, setIsLoading] = useState(false)
  const [detectedLang, setDetectedLang] = useState<string | null>(null)

  const swapLanguages = () => {
    if (sourceLang === 'auto') {
      // If auto-detect, swap based on detected or default to en→pl
      const newSource = detectedLang === 'pl' ? 'pl' : 'en'
      setSourceLang(newSource as 'en' | 'pl')
      setTargetLang(newSource === 'pl' ? 'en' : 'pl')
    } else {
      setSourceLang(targetLang)
      setTargetLang(sourceLang)
    }
    // Swap texts
    setSourceText(translatedText)
    setTranslatedText(sourceText)
    setDetectedLang(null)
  }

  const translate = async () => {
    if (!sourceText.trim() || isLoading) return

    setIsLoading(true)
    setTranslatedText('')
    setDetectedLang(null)

    try {
      const response = await fetch('http://localhost:3000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { 'Authorization': `Bearer ${tokens.accessToken}` }),
        },
        body: JSON.stringify({
          text: sourceText,
          source: sourceLang,
          target: targetLang,
        }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      setTranslatedText(data.translation)
      if (data.source && data.source !== sourceLang) {
        setDetectedLang(data.source)
      }
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText('Translation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText)
    }
  }

  const clearAll = () => {
    setSourceText('')
    setTranslatedText('')
    setDetectedLang(null)
  }

  const languageNames: Record<string, string> = {
    en: 'English',
    pl: 'Polish',
    auto: 'Auto-detect',
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Translation</h2>
        <p className="text-gray-600 mb-4">
          Professional English ↔ Polish translation powered by LibreTranslate
        </p>
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-green-800 text-sm">
            ✅ Self-hosted translation engine ready for bilingual education!
          </p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as 'en' | 'pl' | 'auto')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="pl">Polish</option>
          </select>
          {detectedLang && sourceLang === 'auto' && (
            <p className="text-xs text-blue-600 mt-1">
              Detected: {languageNames[detectedLang] || detectedLang}
            </p>
          )}
        </div>

        <button
          onClick={swapLanguages}
          className="mt-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Swap languages"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as 'en' | 'pl')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="pl">Polish</option>
          </select>
        </div>
      </div>

      {/* Translation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Source Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {sourceLang === 'auto' ? 'Enter text' : languageNames[sourceLang]}
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={sourceLang === 'pl' ? 'Wpisz tekst do przetłumaczenia...' : 'Enter text to translate...'}
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">
              {sourceText.length} characters
            </span>
            {sourceText && (
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Translated Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {languageNames[targetLang]}
          </label>
          <div className="relative">
            <textarea
              value={translatedText}
              readOnly
              placeholder={isLoading ? 'Translating...' : 'Translation will appear here...'}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 bg-gray-50 resize-none"
              rows={6}
            />
            {translatedText && (
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {translatedText.length} characters
          </div>
        </div>
      </div>

      {/* Translate Button */}
      <button
        onClick={translate}
        disabled={isLoading || !sourceText.trim()}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            Translating...
          </>
        ) : (
          <>🌍 Translate</>
        )}
      </button>

      {/* Quick Examples */}
      {!sourceText && (
        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-600 mb-3">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { text: 'Hello, how are you?', lang: 'en' },
              { text: 'Dzień dobry, jak się masz?', lang: 'pl' },
              { text: 'Welcome to our educational platform', lang: 'en' },
              { text: 'Nauka języków jest fascynująca', lang: 'pl' },
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => {
                  setSourceText(example.text)
                  setSourceLang('auto')
                  setTargetLang(example.lang === 'en' ? 'pl' : 'en')
                }}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {example.text.substring(0, 25)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
