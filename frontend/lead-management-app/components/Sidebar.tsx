import Link from 'next/link'
import { Home, Users, PhoneCall, Calendar, BarChart2 } from 'lucide-react'

type Role = 'admin' | 'sales' | 'viewer'

interface SidebarProps {
  userRole: Role | undefined
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'sales', 'viewer'] },
  { name: 'Leads', href: '/leads', icon: Users, roles: ['admin', 'sales', 'viewer'] },
  { name: 'Interactions', href: '/interactions', icon: PhoneCall, roles: ['admin', 'sales', 'viewer'] },
  { name: 'Call Planning', href: '/call-planning', icon: Calendar, roles: ['admin', 'sales', 'viewer'] },
  { name: 'Performance', href: '/performance', icon: BarChart2, roles: ['admin','sales', 'viewer'] },
]

export default function Sidebar({ userRole }: SidebarProps) {
  if (!userRole) return null;

  return (
    <aside className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <ul className="space-y-2">
          {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <li key={item.name}>
              <Link href={item.href} className="flex items-center space-x-2 px-4 py-3 rounded hover:bg-gray-700">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

