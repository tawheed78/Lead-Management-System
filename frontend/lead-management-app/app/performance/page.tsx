'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { fetchLeads } from '@/services/calls/callService'
import { PerformanceData, ChartData, fetchData, calculateTotals, prepareChartData, prepareLineChartData} from '@/services/performance/performanceService'
import {config} from '@/app/config'

interface LineChartData {
  date: string
  orders: number
}

export default function Performance() {
  // const { user, loading } = useAuth('admin')
  // const [restaurants, setRestaurants] = useState([])
  const { loading } = useAuth('admin')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [restaurants, setRestaurants] = useState([])
  const [totalRestaurants, setTotalRestaurants] = useState(0)
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [filteredData, setFilteredData] = useState<PerformanceData[]>([])
  const [totals, setTotals] = useState({ totalOrders: 0, averageOrderValue: 0, totalOrderValue: 0 })
  const [wellPerformingChartData, setWellPerformingChartData] = useState<ChartData[]>([])
  const [underPerformingChartData, setUnderPerformingChartData] = useState<ChartData[]>([])
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      fetchLeads(token).then(data => {
        setRestaurants(data)
        setTotalRestaurants(data.length)
      }).catch(error => {
        console.error('Error fetching dashboard data:', error)
      })
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchData(`${config.BASE_URL}/performance`, token, (data) => {
        setPerformanceData(data)
        console.log(data)
        setFilteredData(data)
        calculateTotals(data, setTotals)
        const lineChartData = prepareLineChartData(data)
        setLineChartData(lineChartData)
      })
      fetchData(`${config.BASE_URL}/performance/well-performing`, token, (data) => {
        setWellPerformingChartData(prepareChartData(data))
      })
      fetchData(`${config.BASE_URL}/performance/under-performing`, token, (data) => {
        setUnderPerformingChartData(prepareChartData(data))
      })
    }
  }, [token])

  useEffect(() => {
    const filtered = performanceData.filter((item) =>
      item.lead_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredData(filtered)
  }, [searchQuery, performanceData])

  if (loading) {
    return <div>Loading...</div>
  }
  console.log('performanceData:', performanceData)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Performance Tracking</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRestaurants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.averageOrderValue} Rs
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalOrderValue} Rs
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Orders by Restaurant (Well Performing)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={wellPerformingChartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Bar dataKey="orders" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Orders by Restaurant (Under Performing)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={underPerformingChartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Bar dataKey="orders" fill="#ff0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Orders Over Time</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="flex space-x-4 mb-4">
        <Input placeholder="Search restaurants..." className="max-w-sm" value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} />
        <Button variant="outline">Search</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Average Order Value</TableHead>
            <TableHead>Total Order Value</TableHead>
            <TableHead>Last Order Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((restaurant) => (
            <TableRow key={restaurant.id}>
              <TableCell>{restaurant.lead_name}</TableCell>
              <TableCell>{restaurant.order_count}</TableCell>
              <TableCell>{restaurant.avg_order_value.toFixed(2)} Rs</TableCell>
              <TableCell>{restaurant.total_order_value} Rs</TableCell>
              <TableCell>{restaurant.last_interaction_date}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
