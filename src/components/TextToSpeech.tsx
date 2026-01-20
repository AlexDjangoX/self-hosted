'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TextToSpeech() {
  const { tokens } = useAuth()
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [language, setLanguage] = useState<'en' | 'pl'>('en')
  const [speed, setSpeed] = useState(1.0)
  const [voices, setVoices] = useState<string[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch available voices on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/tts/voices', {
      headers: {
        ...(tokens?.accessToken && { 'Authorization': `Bearer ${tokens.accessToken}` }),
      },
    })
      .then(res => res.json())
      .then(data => {
        // API returns array directly, not { voices: [...] }
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Loaded ${data.length} voices from XTTS:`, data.slice(0, 5))
          setVoices(data)
          // Set default to first voice (Claribel Dervla)
          setSelectedVoice(data[0])
        }
      })
      .catch(err => {
        console.error('Failed to fetch voices:', err)
        // Set fallback voice
        setVoices(['Claribel Dervla'])
        setSelectedVoice('Claribel Dervla')
      })
  }, [tokens])

  // Clear voice selection when language changes (so Auto takes effect)
  useEffect(() => {
    setSelectedVoice('')
  }, [language])

  const generateSpeech = async () => {
    if (!text.trim() || isLoading) return

    setIsLoading(true)
    setAudioUrl(null)

    try {
      const response = await fetch('http://localhost:3000/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { 'Authorization': `Bearer ${tokens.accessToken}` }),
        },
        body: JSON.stringify({
          text,
          language,
          speed,
          ...(selectedVoice && { speaker: selectedVoice }),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      // Get the audio blob
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioUrl(audioUrl)
    } catch (error) {
      console.error('TTS error:', error)
      alert('Failed to generate speech. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = 'generated-speech.wav'
      link.click()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Text-to-Speech</h2>
        <p className="text-gray-600 mb-4">Convert text to natural speech using XTTS v2 neural TTS</p>
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-green-800 text-sm">
            ✅ XTTS v2 provides professional-quality multilingual speech synthesis
          </p>
          <p className="text-green-700 text-xs mt-1">
            Note: Generation takes ~20-30 seconds on CPU (faster with GPU)
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'pl')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="pl">Polish</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speaker {voices.length > 0 ? `(${voices.length} available)` : ''}
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Default (Claribel Dervla)</option>
              {voices.map((voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter text to convert to speech
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Witaj! Hello! This is a demonstration of multilingual text-to-speech..."
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          maxLength={50000}
        />
        <div className="text-sm text-gray-500 mt-1">
          {text.length}/50,000 characters
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={generateSpeech}
          disabled={isLoading || !text.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              Generating Speech (20-30s)...
            </>
          ) : (
            <>🔊 Generate Speech</>
          )}
        </button>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Speech</h3>

          {/* Audio Controls */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <audio
              ref={audioRef}
              controls
              className="w-full mb-3"
              src={audioUrl}
            >
              Your browser does not support the audio element.
            </audio>

            <div className="flex gap-2">
              <button
                onClick={playAudio}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                ▶️ Play
              </button>
              <button
                onClick={downloadAudio}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                💾 Download WAV
              </button>
            </div>
          </div>

          {/* Text Display */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Original Text:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
          </div>
        </div>
      )}

      {!audioUrl && !isLoading && (
        <div className="text-center text-gray-500 py-8 border-t">
          <p className="text-lg">🔊 Ready to convert text to speech!</p>
          <p className="text-sm mt-2">Enter text....</p>
        </div>
      )}
    </div>
  )
}