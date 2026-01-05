"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ApiTest() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async (endpoint: string) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const url = `${process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL}${endpoint}`
      console.log('Testing API:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${response.status}: ${errorText}`)
      }

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      console.error('API Test Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">API Test</h3>
      
      <div className="space-x-2 mb-4">
        <Button 
          onClick={() => testApi('/accounts/payer')} 
          disabled={loading}
          size="sm"
        >
          Test Payer API
        </Button>
        <Button 
          onClick={() => testApi('/accounts/usage')} 
          disabled={loading}
          size="sm"
        >
          Test Usage API
        </Button>
      </div>

      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Response:</strong>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
