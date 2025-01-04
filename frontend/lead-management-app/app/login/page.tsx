'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {config} from '@/app/config'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch(`${config.BASE_URL}/user/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        await Promise.all([
          localStorage.setItem('token', data.access_token),
          document.cookie = `token=${data.access_token}; path=/`
        ]);
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {/* Log in */}
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{'  '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-gray-00 w-[300px]">
      Note: Backend is hosted on a free tier and may take up to 30 seconds to respond after periods of inactivity.
      </p>
    </div>
  )
}