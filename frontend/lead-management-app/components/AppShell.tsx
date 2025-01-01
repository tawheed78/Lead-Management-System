'use client'

import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '@/hooks/useAuth'

export interface User {
 id: string
 username: string
 role: 'admin' | 'sales' | 'viewer'
}

export default function AppShell({
 children,
}: {
 children: React.ReactNode
}) {
 const { user, loading } = useAuth()
 if (loading) {
 return <div>Loading...</div>
 }

 return (
    <div className="flex h-screen bg-gray-100">
        {user && <Sidebar userRole={user.role} />}
        <div className="flex-1 flex flex-col overflow-hidden">
            {user && <Header user={user} />}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                {children}
            </main>
        </div>
    </div>
 );
}