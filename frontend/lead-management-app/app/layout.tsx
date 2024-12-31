'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useAuth } from '@/hooks/useAuth'

const inter = Inter({ subsets: ['latin'] })

export interface User {
  id: string
  // name: string
  username: string
  role: 'admin' | 'sales' | 'viewer'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          {/* {user && <Sidebar userRole={user.role} />} */}
          <Sidebar userRole={user ? user.role : 'viewer'} />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* {user && <Header user={user} />} */}
            <Header user={user || {id: '99999', username: 'Guest', role: 'viewer' }} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}

// 'use client'

// import './globals.css'
// import { Inter } from 'next/font/google'
// import Header from '../components/Header'
// import Sidebar from '../components/Sidebar'
// import { useAuth } from '@/hooks/useAuth'

// const inter = Inter({ subsets: ['latin'] })

// export interface User {
//   id: string
//   username: string
//   role: 'admin' | 'sales' | 'viewer'
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const { user, loading } = useAuth()
//   if (loading) {
//     return <div>Loading...</div>
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {user && <Sidebar userRole={user.role} />}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {user && <Header user={user} />}
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }
