import {formatDate} from '@/app/config'

export interface PerformanceData {
  id: string
  order_count: number
  total_order_value: number
  avg_order_value: number
  last_interaction_date: string
  lead_name: string
}

export interface ChartData {
  name: string
  orders: number
  totalValue: number
  avgValue: number
}

export interface LineChartData {
  date: string
  orders: number
}

export const fetchData = async (url: string, token: string, onSuccess: (data: PerformanceData[]) => void) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (response.ok) {
    const data: PerformanceData[] = await response.json()
    onSuccess(data)
  } else {
    console.error('Failed to fetch data from', url)
  }
}

export const calculateTotals = (data: PerformanceData[], setTotals: (totals: { totalOrders: number, averageOrderValue: number, totalOrderValue: number }) => void) => {
  const totalOrders = data.reduce((sum, item) => sum + item.order_count, 0)
  const totalOrderValue = data.reduce((sum, item) => sum + item.total_order_value, 0)
  const averageOrderValue = parseFloat((totalOrderValue / data.length).toFixed(2))

  setTotals({ totalOrders, averageOrderValue, totalOrderValue })
}

export const prepareChartData = (data: PerformanceData[]) => {
  return data.map(item => ({
    name: item.lead_name,
    orders: item.order_count,
    totalValue: item.total_order_value,
    avgValue: item.avg_order_value,
  }))
}

// export const prepareLineChartData = (data: PerformanceData[]) => {
//   return data
//     .sort((a, b) => new Date(a.last_interaction_date).getTime() - new Date(b.last_interaction_date).getTime()) // Sort by date
//     .map(item => ({
//       date: formatDate(item.last_interaction_date),
//       orders: item.order_count,
//     }));
// }

export const prepareLineChartData = (data: PerformanceData[]): LineChartData[] => {
  const aggregatedData: { [key: string]: number } = {}

  data.forEach(item => {
    const date = item.last_interaction_date.split('T')[0] // Extract the date part
    if (!aggregatedData[date]) {
      aggregatedData[date] = 0
    }
    aggregatedData[date] += item.order_count
  })

  const sortedData = Object.keys(aggregatedData)
  .map(date => ({ date, orders: aggregatedData[date] }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return sortedData
}
