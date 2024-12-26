'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Lead {
  id: string
  name: string
}

interface Call {
  id: string
  leadId: string
  leadName: string
  contact: string
  date: string
  time: string
  notes: string
}

export default function CallPlanning() {
  const { user, loading } = useAuth('admin')
  const [calls, setCalls] = useState<Call[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [newCall, setNewCall] = useState<Omit<Call, 'id' | 'leadName'>>({ leadId: '', contact: '', date: '', time: '', notes: '' })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCall, setEditingCall] = useState<Call | null>(null)

  useEffect(() => {
    // Fetch calls and leads from API
    fetchCalls()
    fetchLeads()
  }, [])

  const fetchCalls = async () => {
    // In a real app, this would be an API call
    const mockCalls: Call[] = [
      { id: '1', leadId: '1', leadName: 'Restaurant A', contact: 'John Doe', date: '2023-06-01', time: '10:00', notes: 'Follow up on last order' },
      { id: '2', leadId: '2', leadName: 'Restaurant B', contact: 'Jane Smith', date: '2023-06-02', time: '14:00', notes: 'Introduce new products' },
    ]
    setCalls(mockCalls)
  }

  const fetchLeads = async () => {
    // In a real app, this would be an API call
    const mockLeads: Lead[] = [
      { id: '1', name: 'Restaurant A' },
      { id: '2', name: 'Restaurant B' },
      { id: '3', name: 'Restaurant C' },
    ]
    setLeads(mockLeads)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCall({ ...newCall, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewCall({ ...newCall, [name]: value })
  }

  const handleAddCall = async () => {
    // In a real app, this would be an API call
    const addedCall: Call = {
      id: String(calls.length + 1),
      leadName: leads.find(lead => lead.id === newCall.leadId)?.name || '',
      ...newCall
    }
    setCalls([...calls, addedCall])
    setNewCall({ leadId: '', contact: '', date: '', time: '', notes: '' })
    setIsAddModalOpen(false)
  }

  const handleEditCall = (call: Call) => {
    setEditingCall(call)
    setIsEditModalOpen(true)
  }

  const handleUpdateCall = async () => {
    if (editingCall) {
      // In a real app, this would be an API call
      const updatedCalls = calls.map(call => 
        call.id === editingCall.id ? editingCall : call
      )
      setCalls(updatedCalls)
      setIsEditModalOpen(false)
      setEditingCall(null)
    }
  }

  const handleDeleteCall = async (id: string) => {
    // In a real app, this would be an API call
    const updatedCalls = calls.filter(call => call.id !== id)
    setCalls(updatedCalls)
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
                <Label htmlFor="leadId" className="text-right">Lead</Label>
                <Select onValueChange={(value) => handleSelectChange('leadId', value)}>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">Contact</Label>
                <Input id="contact" name="contact" value={newCall.contact} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" name="date" type="date" value={newCall.date} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Time</Label>
                <Input id="time" name="time" type="time" value={newCall.time} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <Input id="notes" name="notes" value={newCall.notes} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <Button onClick={handleAddCall}>Add Call</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell>{call.leadName}</TableCell>
              <TableCell>{call.contact}</TableCell>
              <TableCell>{call.date}</TableCell>
              <TableCell>{call.time}</TableCell>
              <TableCell>{call.notes}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditCall(call)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteCall(call.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Call</DialogTitle>
          </DialogHeader>
          {editingCall && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLeadId" className="text-right">Lead</Label>
                <Select onValueChange={(value) => setEditingCall({ ...editingCall, leadId: value, leadName: leads.find(lead => lead.id === value)?.name || '' })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={editingCall.leadName} />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editContact" className="text-right">Contact</Label>
                <Input id="editContact" name="contact" value={editingCall.contact} onChange={(e) => setEditingCall({ ...editingCall, contact: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDate" className="text-right">Date</Label>
                <Input id="editDate" name="date" type="date" value={editingCall.date} onChange={(e) => setEditingCall({ ...editingCall, date: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTime" className="text-right">Time</Label>
                <Input id="editTime" name="time" type="time" value={editingCall.time} onChange={(e) => setEditingCall({ ...editingCall, time: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editNotes" className="text-right">Notes</Label>
                <Input id="editNotes" name="notes" value={editingCall.notes} onChange={(e) => setEditingCall({ ...editingCall, notes: e.target.value })} className="col-span-3" />
              </div>
            </div>
          )}
          <Button onClick={handleUpdateCall}>Update Call</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

