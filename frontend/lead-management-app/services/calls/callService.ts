import internal from "stream"
import {config} from '@/app/config'


export interface Lead {
  id: string
  name: string
}


export interface Call {
  id: string
  lead_id: string
  lead_name: string
  poc_name: string
  poc_contact: string
  next_call_date: string
  next_call_time: string
  notes: string
  frequency: string
  log: string
}

export const fetchLeads = async (token: string) => {
  const response = await fetch(`${config.BASE_URL}/lead`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch leads')
  }
  return response.json()
}

export const fetchPointOfContacts = async (token: string, lead_id: string) => {
  const response = await fetch(`${config.BASE_URL}/lead/${lead_id}/pocs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch leads')
  }
  return response.json()
}

export const fetchCalls = async (token: string) => {
  const response = await fetch(`${config.BASE_URL}/calls`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  
  })
  if (!response.ok) {
    throw new Error('Failed to fetch calls')
  }
  
  return response.json()
}
export const addCall = async (newCall: Omit<Call, 'id'>, token: string) => {
  const response = await fetch(`${config.BASE_URL}/lead/${newCall.lead_id}/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newCall),
  })
  if (!response.ok) {
    throw new Error('Failed to add call')
  }
  return response.json()
}

export const deleteCall = async (leadId: string, callId: string, token: string) => {
  const response = await fetch(`${config.BASE_URL}/lead/${leadId}/call/${callId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to delete call')
  }
}

export const updateCallFrequency = async (leadId: string, callId: string, frequency: string, token: string) => {
  const response = await fetch(`${config.BASE_URL}/lead/${leadId}/call/${callId}/frequency`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ frequency }),
  })
  if (!response.ok) {
    throw new Error('Failed to update call frequency')
  }
  return response.json()
}

export const updateCallLog = async (leadId: string, callId: string, token: string) => {
  const response = await fetch(`${config.BASE_URL}/lead/${leadId}/call/${callId}/log`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to update call log')
  }
  return response.json()
}