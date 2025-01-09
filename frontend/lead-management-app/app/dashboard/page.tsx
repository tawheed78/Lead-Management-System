'use client'

import { Card } from '@/components/ui/card'
import { DialogHeader } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogOverlay } from '@radix-ui/react-dialog'
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
          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
          <DialogContent className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <DialogHeader>
                <DialogTitle>Today&apos;s Calls</DialogTitle>
              </DialogHeader>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Restaurant</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysCalls.length > 0 ? (
                    todaysCalls.map((call) => (
                      <tr key={call.id}>
                        <td className="border px-4 py-2">{call.lead_name}</td>
                        <td className="border px-4 py-2">{call.poc_contact}</td>
                        <td className="border px-4 py-2">{call.next_call_time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4">No calls for today</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button
                onClick={() => setIsCallsModalOpen(false)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}