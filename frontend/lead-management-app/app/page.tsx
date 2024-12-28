'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchDashboardData } from '@/services/dashboardService'
// Mock data for today's calls
// const todaysCalls = [
//   { id: 1, restaurant: "Joe's Diner", contact: "Joe Smith", time: "10:00 AM" },
//   { id: 2, restaurant: "Pizza Palace", contact: "Maria Garcia", time: "11:30 AM" },
//   { id: 3, restaurant: "Sushi Spot", contact: "Yuki Tanaka", time: "2:00 PM" },
//   { id: 4, restaurant: "Burger Barn", contact: "Bob Johnson", time: "3:30 PM" },
// ]



export default function Dashboard() {
  const { user, loading, error } = useAuth('admin')
  const [isCallsModalOpen, setIsCallsModalOpen] = useState(false)
  const [totalLeads, setTotalLeads] = useState(0)
  const [activeLeads, setActiveLeads] = useState(0)
  const [todaysCalls, setTodaysCalls] = useState([])

  const token = localStorage.getItem('token')
  
  useEffect(() => {
    async function loadData() {
      try {
        if (token) {
          const data = await fetchDashboardData(token)
          console.log('Dashboard data:', data)
          setTotalLeads(data.totalLeads)
          setActiveLeads(data.activeLeads)
          setTodaysCalls(data.todaysCalls)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadData()
  }, [])

  if (loading) {
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
                <p className="text-3xl font-bold">{todaysCalls}</p>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Today's Calls</DialogTitle>
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
                {/* {todaysCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>{call.restaurant}</TableCell>
                    <TableCell>{call.contact}</TableCell>
                    <TableCell>{call.time}</TableCell>
                  </TableRow>
                ))} */}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">Orders This Week</h3>
            <p className="text-3xl font-bold">42</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

