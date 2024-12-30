interface Lead {
  id: string
  name: string
  status: string
}

export interface TodaysCalls {
  id: string
  lead_name: string
  poc_contact: string
  next_call_time: string
}

export async function fetchDashboardData(token: string) {
    try {
        const leadsResponse = await fetch('http://127.0.0.1:8000/api/lead', {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        })
        const callsResponse = await fetch('http://127.0.0.1:8000/api/calls/today', {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        })
        
      if (leadsResponse.ok && callsResponse.ok) {
        const leadsData = await leadsResponse.json()
        const callsData = await callsResponse.json()
        const activeLeadsData = leadsData.filter((lead:Lead) => lead.status !== 'Inactive')
        return {
          totalLeads: leadsData.length,
          activeLeads: activeLeadsData.length,
          todaysCalls: callsData,
        }
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    }catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }



  