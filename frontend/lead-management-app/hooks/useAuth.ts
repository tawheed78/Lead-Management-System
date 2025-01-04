'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {config} from '@/app/config'
import { User } from '@/components/AppShell'

export function useAuth(requiredRole?: 'admin' | 'sales' | 'viewer') {
 const [user, setUser] = useState<User | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const router = useRouter()
 const pathname = usePathname()

 useEffect(() => {
 const token = localStorage.getItem('token')
 
 if (pathname === '/login' || pathname === '/register') {
 setLoading(false)
 return
 }

 if (!token) {
 setLoading(false)
 router.push('/login')
 return
 }

 async function checkAuth() {
 try {
 const response = await fetch(`${config.BASE_URL}/user/auth/me`, {
 headers: { Authorization: `Bearer ${token}` }
 })

 if (!response.ok) {
 throw new Error('Failed to fetch user data')
 }

 const userData: User = await response.json()
 setUser(userData)
 
 if (requiredRole && userData.role !== requiredRole) {
 router.push('/unauthorized')
 }
 } catch (error) {
 console.error('Auth error:', error)
 setError('Authentication failed')
 router.push('/login')
 } finally {
 setLoading(false)
 }
 }

 checkAuth()
 }, [requiredRole, router, pathname])

 return { user, loading, error }
}