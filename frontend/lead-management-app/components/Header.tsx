import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {User} from '@/app/layout'


interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
 
  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/login')
  }

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Lead Management System</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* <span className="text-gray-600">Welcome, {user.username}</span> */}
              <span className="text-gray-600">Welcome</span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

