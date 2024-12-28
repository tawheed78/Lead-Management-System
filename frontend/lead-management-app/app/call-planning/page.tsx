'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaTrash, FaEdit, FaPhone } from 'react-icons/fa';

interface Lead {
  id: string
  name: string
}


interface Call {
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

const BASE_URL = 'http://127.0.0.1:8000/api/lead'

const fetchLeads = async (token: string) => {
  const response = await fetch(`${BASE_URL}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch leads')
  }
  return response.json()
}

const fetchPointOfContacts = async (token: string, lead_id: string) => {
  const response = await fetch(`${BASE_URL}/${lead_id}/pocs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch leads')
  }
  return response.json()
}

const fetchCalls = async (token: string) => {
  const response = await fetch(`${BASE_URL}/calls/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch calls')
  }
  
  return response.json()
}

const addCall = async (newCall: Omit<Call, 'id'>, token: string) => {
  const response = await fetch(`${BASE_URL}/${newCall.lead_id}/call`, {
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

const deleteCall = async (leadId: string, callId: string, token: string) => {
  const response = await fetch(`${BASE_URL}/${leadId}/call/${callId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to delete call')
  }
}

const updateCallFrequency = async (leadId: string, callId: string, frequency: string, token: string) => {
  const response = await fetch(`${BASE_URL}/${leadId}/call/${callId}/frequency`, {
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

const updateCallLog = async (leadId: string, callId: string, token: string) => {
  const response = await fetch(`${BASE_URL}/${leadId}/call/${callId}/log`, {
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

export default function CallPlanning() {
  const { user, loading } = useAuth('admin')
  const [calls, setCalls] = useState<Call[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [pointOfContacts, setPointOfContacts] = useState<Lead[]>([])
  const [newCall, setNewCall] = useState<Omit<Call, 'id'>>({ lead_id: '', lead_name: '', poc_contact: '', poc_name: '', next_call_date: '', next_call_time: '', notes: '', frequency: '', log: '' })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [updateFrequency, setUpdateFrequency] = useState('');
  // const [updateDate, setUpdateDate] = useState('');
  // const [updateTime, setUpdateTime] = useState('');

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        const leadsData = await fetchLeads(token)
        setLeads(leadsData)
        const callsData = await fetchCalls(token)
        setCalls(callsData)
      }
      fetchData()
    }
  }, [token])

  useEffect(() => {
    if (token && newCall.lead_id) {
      const fetchPOCs = async () => {
        const pointOfContactsData = await fetchPointOfContacts(token, newCall.lead_id);
        setPointOfContacts(pointOfContactsData);
      };
      fetchPOCs();
    }
  }, [newCall.lead_id, token]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCall((prevCall) => ({
      ...prevCall,
      [name]: value,
    }));
  };


  const handleSelectChange = (name: string, value: string) => {
    setNewCall((prevCall) => ({
      ...prevCall,
      [name]: value,
    }));
  };


  const openUpdateModal = (call: Call) => {
    setSelectedCall(call);
    setUpdateFrequency(call.frequency);
    // setUpdateDate(call.next_call_date);
    // setUpdateTime(call.next_call_time);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateFrequency(e.target.value);
  };

  // const handleUpdateDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setUpdateDate(e.target.value);
  // };

  // const handleUpdateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setUpdateTime(e.target.value);
  // };

  const handleAddCall = async () => {
    if (token) {
      try {
        const addedCall = await addCall(newCall, token)
        setCalls((prevCalls) => [...prevCalls, addedCall]);
        setIsAddModalOpen(false);
      } catch (error) {
        console.error('Error adding call:', error)
      }
    }
  }

  const handleDeleteCall = async (leadId: string, callId: string) => {
    if (token) {
      try {
        await deleteCall(leadId, callId, token)
        const updatedCalls = calls.filter(call => call.id !== callId)
        setCalls(updatedCalls)
      } catch (error) {
        console.error('Error deleting call:', error)
      }
    }
  }

  const handleUpdateCallFrequency = async () => {
    if (token && selectedCall) {
      try {
        const updatedCall = await updateCallFrequency(selectedCall.lead_id, selectedCall.id, updateFrequency, token)
        const [next_call_date, next_call_time] = updatedCall.next_call_date.split('T');
        setCalls((prevCalls) =>
          prevCalls.map((call) =>
            call.id === selectedCall.id ? { ...call, frequency: updatedCall.frequency, next_call_date, next_call_time } : call
          )
        );
        setIsUpdateModalOpen(false);
      } catch (error) {
        console.error('Error updating call frequency:', error)
      }
    }
  }

  const handleUpdateCallLog = async (leadId: string, callId: string) => {
    if (token) {
      try {
        const updatedCall = await updateCallLog(leadId, callId, token)
        setCalls((prevCalls) =>
          prevCalls.map((call) =>
            call.id === callId ? { ...call, last_call_date: updatedCall.last_call_date, next_call_date: updatedCall.next_call_date } : call
          )
        );
      } catch (error) {
        console.error('Error updating call log:', error)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Call Planning</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Call</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Call</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lead_id" className="text-right">Lead</Label>
                <Select onValueChange={(value) => handleSelectChange('lead_id', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">Contact</Label>
                <Input id="contact" name="contact" value={newCall.poc_contact} onChange={handleInputChange} className="col-span-3" />
              </div> */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pocId" className="text-right">Point of Contact</Label>
                <Select onValueChange={(value) => handleSelectChange('poc_id', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select point of contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {pointOfContacts.map((poc) => (
                      <SelectItem key={poc.id} value={poc.id}>{poc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="next_call_date" className="text-right">Date</Label>
                <Input id="next_call_date" name="next_call_date" type="date" value={newCall.next_call_date} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="next_call_time" className="text-right">Time</Label>
                <Input id="next_call_time" name="next_call_time" type="time" value={newCall.next_call_time} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">Frequency</Label>
                <Input id="frequency" name="frequency" value={newCall.frequency} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <Button onClick={handleAddCall}>Add Call</Button>
          </DialogContent>
        </Dialog>
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Call Frequency</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="updateFrequency" className="text-right">Frequency</Label>
              <Input id="updateFrequency" name="updateFrequency" type="number" value={updateFrequency} onChange={handleUpdateFrequencyChange} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleUpdateCallFrequency}>Update Call</Button>
        </DialogContent>
      </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Point of Contact</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Next Call Date</TableHead>
            <TableHead>Next Call Time</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell>{call.lead_name}</TableCell>
              <TableCell>{call.poc_name}</TableCell>
              <TableCell>{call.poc_contact}</TableCell>
              <TableCell>{call.next_call_date}</TableCell>
              <TableCell>{call.next_call_time}</TableCell>
              <TableCell>{call.frequency}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteCall(call.lead_id, call.id)} style={{ marginRight: '8px' }}><FaTrash /></Button>
                <Button size="sm" onClick={() => openUpdateModal(call)} style={{marginRight: '8px'}}><FaEdit /></Button>
                <Button size="sm" onClick={() => handleUpdateCallLog(call.lead_id, call.id)} style={{ marginRight: '8px' }} ><FaPhone /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}