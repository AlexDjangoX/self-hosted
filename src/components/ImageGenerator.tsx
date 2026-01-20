'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ImageGenerator() {
  const { tokens } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [provider] = useState<'stable-diffusion'>('stable-diffusion')
  const [error, setError] = useState<string | null>(null)
  const [size, setSize] = useState('512x512')
  const [quality, setQuality] = useState<'standard' | 'hd'>('hd')

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setImages([])

    try {
      const response = await fetch('http://localhost:3000/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { 'Authorization': `Bearer ${tokens.accessToken}` }),
        },
        body: JSON.stringify({
          prompt,
          provider,
          size,
          quality,
          n: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      setImages(data.images || [])
    } catch (error) {
      console.error('Image generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`Failed to generate image: ${errorMessage}`)
      alert(`Failed to generate image: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Image Generation</h2>
        <p className="text-gray-600 mb-4">Generate images from text prompts using Stable Diffusion</p>

        {/* Status Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-green-800 text-sm">
            ✅ Using Automatic1111 Stable Diffusion for reliable image generation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="256x256">256x256</option>
              <option value="512x512">512x512</option>
              <option value="1024x1024">1024x1024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as 'standard' | 'hd')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe the image you want to generate
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A beautiful sunset over mountains with a lake in the foreground..."
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      {/* Generate Button */}
        <div className="mb-6">
          <button
            onClick={generateImage}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                Generating with Stable Diffusion...
              </>
            ) : (
              <>🎨 Generate Image</>
            )}
          </button>

          <p className="text-sm text-gray-600 mt-2 text-center">
            🎨 Automatic1111 Stable Diffusion WebUI provides industry-standard image generation
          </p>
        </div>

      {/* Generated Images */}
      {images.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-auto"
                />
                <div className="p-3 bg-gray-50">
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = imageUrl
                      link.download = `generated-image-${index + 1}.png`
                      link.click()
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Download Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8 border-t">
          <p className="text-lg">🎨 Ready to generate amazing images!</p>
          <p className="text-sm mt-2">Enter a prompt......</p>
        </div>
      )}
    </div>
  )
}