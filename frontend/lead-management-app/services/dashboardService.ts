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
        return {
          totalLeads: leadsData.length,
          activeLeads: leadsData.activeLeads,
          todaysCalls: callsData.length,
        }
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    }catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }