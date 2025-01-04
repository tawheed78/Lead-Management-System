'use client'

import { Card } from '@/components/ui/card'
import { DialogHeader } from '@/components/ui/dialog'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog'
import { Table } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { TodaysCalls, fetchDashboardData } from '@/services/dashboardService'

export default function Dashboard() {
  const { loading } = useAuth('admin')
  const [isCallsModalOpen, setIsCallsModalOpen] = useState(false)
  const [totalLeads, setTotalLeads] = useState(0)
  const [activeLeads, setActiveLeads] = useState(0)
  const [todaysCalls, setTodaysCalls] = useState<TodaysCalls[]>([])
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    async function loadData() {
      try {
        if (token) {
          const data = await fetchDashboardData(token)
          setTotalLeads(data.totalLeads)
          setActiveLeads(data.activeLeads)
          setTodaysCalls(data.todaysCalls)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    loadData()
  }, [token])

  useEffect(() => {
    // Only run after component mounts to avoid hydration issues
    setToken(localStorage.getItem('token'))
  }, [])

  // Show loading state or redirect if no token
  if (loading || !token) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">Total Leads</h3>
            <p className="text-3xl font-bold">{totalLeads}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">Active Leads</h3>
            <p className="text-3xl font-bold">{activeLeads}</p>
          </div>
        </Card>
        <Dialog open={isCallsModalOpen} onOpenChange={setIsCallsModalOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Calls Today</h3>
                <p className="text-3xl font-bold">{todaysCalls.length}</p>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Today&apos;s Calls</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>{call.lead_name}</TableCell>
                    <TableCell>{call.poc_contact}</TableCell>
                    <TableCell>{call.next_call_time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}