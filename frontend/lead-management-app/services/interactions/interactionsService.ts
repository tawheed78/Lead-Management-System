// import { Interaction, Lead, AddInteraction } from './interactionTypes';
export interface Lead {
    id: string;
    name: string;
  }
  
  export interface Order {
    item: string;
    quantity: string;
    price: string;
  }
  
export interface Interaction {
    id: string;
    lead_id: string;
    lead_name: string;
    call_id: string;
    interaction_type: string;
    interaction_date: string;
    order: Order[];
    interaction_notes: string;
    follow_up: string
  }
  
export interface AddInteraction {
    id: string;
    lead_id: string;
    lead_name: string;
    interaction_type: string;
    interaction_date: string;
    order: Order[];
    interaction_notes: string;
    follow_up: string;
  }

export const fetchInteractions = async (): Promise<Interaction[]> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:8000/api/interactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Failed to fetch interactions')
        return []
      }
    } catch (error) {
      console.error('Error fetching interactions:', error)
      return []
    }
  }
  
  export const fetchLeads = async (): Promise<Lead[]> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:8000/api/lead', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Failed to fetch leads')
        return []
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      return []
    }
  }
  
  export const addInteraction = async (newInteraction: AddInteraction): Promise<Interaction | null> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://127.0.0.1:8000/api/interactions/${newInteraction.lead_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newInteraction),
      })
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Failed to add interaction')
        return null
      }
    } catch (error) {
      console.error('Error adding Interaction:', error)
      return null
    }
  }
  
  export const updateInteraction = async (interaction: Interaction): Promise<Interaction | null> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://127.0.0.1:8000/api/interactions/${interaction.lead_id}/${interaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(interaction),
      })
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Failed to update interaction')
        return null
      }
    } catch (error) {
      console.error('Error updating interaction:', error)
      return null
    }
  }
  
  export const deleteInteraction = async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://127.0.0.1:8000/api/interactions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        return true
      } else {
        console.error('Failed to delete interaction')
        return false
      }
    } catch (error) {
      console.error('Error deleting interaction:', error)
      return false
    }
  }
  
  