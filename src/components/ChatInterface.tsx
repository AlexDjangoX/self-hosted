'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const { tokens } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<'ollama' | 'localai'>('ollama')
  const [model, setModel] = useState('llama3.2:3b')

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokens?.accessToken && { 'Authorization': `Bearer ${tokens.accessToken}` }),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          provider,
          model,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || data.content || 'No response'
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Chat</h2>
        <p className="text-gray-600 mb-4">Have conversations with Ollama models running locally</p>

        {/* Settings */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'ollama' | 'localai')}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ollama">Ollama (llama3.2)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Model name"
            />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto border border-slate-300 rounded-lg p-6 mb-6 bg-slate-50 shadow-inner">
        {messages.length === 0 ? (
          <div className="text-center text-slate-600 mt-12">
            <div className="text-6xl mb-4">👋</div>
            <p className="text-xl font-medium mb-2 text-slate-700">Welcome to Self-Hosted AI Chat!</p>
            <p className="text-slate-500">Start a conversation with your local AI models. No cloud required!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-12 text-gray-900'
                  : 'bg-white mr-12 border text-gray-900'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {message.role === 'user' ? 'You:' : 'AI:'}
                </span>
                <div className="flex-1 whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-white mr-12 border rounded-lg p-3 text-gray-900">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">AI:</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        <button
          onClick={clearChat}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}