import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {config} from '@/app/config'

type Role = 'admin' | 'sales' | 'viewer'

interface User {
  id: string
  username: string
  role: Role
}

export function useAuth(requiredRole?: Role) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setLoading(false);
      return;
    }
    
    async function checkAuth() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        // Fetch user details from backend like role, username.
        const response = await fetch(`${config.BASE_URL}/user/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData: User = await response.json()
          setUser(userData)
          if (requiredRole && userData.role !== requiredRole) {
            router.push('/unauthorized')
          }
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Auth error:', error)
        setError('Authentication failed. Please try logging in again.')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, router])

  return { user, loading, error }
}
