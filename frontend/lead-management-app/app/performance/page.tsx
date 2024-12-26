'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

export default function Performance() {
  const { user, loading } = useAuth('admin')
  const [restaurants, setRestaurants] = useState([
    { id: 1, name: 'Restaurant A', totalOrders: 150, averageOrderValue: 75, lastOrderDate: '2023-05-15' },
    { id: 2, name: 'Restaurant B', totalOrders: 200, averageOrderValue: 60, lastOrderDate: '2023-05-20' },
    { id: 3, name: 'Restaurant C', totalOrders: 100, averageOrderValue: 90, lastOrderDate: '2023-05-22' },
  ])

  const chartData = [
    { name: 'Restaurant A', orders: 150 },
    { name: 'Restaurant B', orders: 200 },
    { name: 'Restaurant C', orders: 100 },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Performance Tracking</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.reduce((sum, restaurant) => sum + restaurant.totalOrders, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(restaurants.reduce((sum, restaurant) => sum + restaurant.averageOrderValue, 0) / restaurants.length).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Order Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants.reduce((latest, restaurant) => 
                latest > restaurant.lastOrderDate ? latest : restaurant.lastOrderDate
              , '2000-01-01')}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Orders by Restaurant</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Bar dataKey="orders" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="flex space-x-4 mb-4">
        <Input placeholder="Search restaurants..." className="max-w-sm" />
        <Button variant="outline">Search</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Average Order Value</TableHead>
            <TableHead>Last Order Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((restaurant) => (
            <TableRow key={restaurant.id}>
              <TableCell>{restaurant.name}</TableCell>
              <TableCell>{restaurant.totalOrders}</TableCell>
              <TableCell>${restaurant.averageOrderValue.toFixed(2)}</TableCell>
              <TableCell>{restaurant.lastOrderDate}</TableCell>
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

