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

interface Interaction {
  id: string
  leadId: string
  leadName: string
  type: string
  date: string
  notes: string
}

export default function Interactions() {
  const { user, loading } = useAuth('admin')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [newInteraction, setNewInteraction] = useState<Omit<Interaction, 'id' | 'leadName'>>({ leadId: '', type: '', date: '', notes: '' })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [filterLead, setFilterLead] = useState<string>('')

  useEffect(() => {
    // Fetch interactions and leads from API
    fetchInteractions()
    fetchLeads()
  }, [])

  const fetchInteractions = async () => {
    // In a real app, this would be an API call
    const mockInteractions: Interaction[] = [
      { id: '1', leadId: '1', leadName: 'Restaurant A', type: 'Call', date: '2023-06-01', notes: 'Discussed new menu items' },
      { id: '2', leadId: '2', leadName: 'Restaurant B', type: 'Email', date: '2023-06-02', notes: 'Sent product catalog' },
    ]
    setInteractions(mockInteractions)
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
    setNewInteraction({ ...newInteraction, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewInteraction({ ...newInteraction, [name]: value })
  }

  const handleAddInteraction = async () => {
    // In a real app, this would be an API call
    const addedInteraction: Interaction = {
      id: String(interactions.length + 1),
      leadName: leads.find(lead => lead.id === newInteraction.leadId)?.name || '',
      ...newInteraction
    }
    setInteractions([...interactions, addedInteraction])
    setNewInteraction({ leadId: '', type: '', date: '', notes: '' })
    setIsAddModalOpen(false)
  }

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction)
    setIsEditModalOpen(true)
  }

  const handleUpdateInteraction = async () => {
    if (editingInteraction) {
      // In a real app, this would be an API call
      const updatedInteractions = interactions.map(interaction => 
        interaction.id === editingInteraction.id ? editingInteraction : interaction
      )
      setInteractions(updatedInteractions)
      setIsEditModalOpen(false)
      setEditingInteraction(null)
    }
  }

  const handleDeleteInteraction = async (id: string) => {
    // In a real app, this would be an API call
    const updatedInteractions = interactions.filter(interaction => interaction.id !== id)
    setInteractions(updatedInteractions)
  }

  const filteredInteractions = filterLead
    ? interactions.filter(interaction => interaction.leadId === filterLead)
    : interactions

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Interactions</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Interaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Interaction</DialogTitle>
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
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" name="date" type="date" value={newInteraction.date} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <Input id="notes" name="notes" value={newInteraction.notes} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <Button onClick={handleAddInteraction}>Add Interaction</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setFilterLead}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by lead" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Leads</SelectItem>
            {leads.map((lead) => (
              <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInteractions.map((interaction) => (
            <TableRow key={interaction.id}>
              <TableCell>{interaction.leadName}</TableCell>
              <TableCell>{interaction.type}</TableCell>
              <TableCell>{interaction.date}</TableCell>
              <TableCell>{interaction.notes}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditInteraction(interaction)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteInteraction(interaction.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Interaction</DialogTitle>
          </DialogHeader>
          {editingInteraction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLeadId" className="text-right">Lead</Label>
                <Select onValueChange={(value) => setEditingInteraction({ ...editingInteraction, leadId: value, leadName: leads.find(lead => lead.id === value)?.name || '' })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={editingInteraction.leadName} />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editType" className="text-right">Type</Label>
                <Select onValueChange={(value) => setEditingInteraction({ ...editingInteraction, type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={editingInteraction.type} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDate" className="text-right">Date</Label>
                <Input id="editDate" name="date" type="date" value={editingInteraction.date} onChange={(e) => setEditingInteraction({ ...editingInteraction, date: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editNotes" className="text-right">Notes</Label>
                <Input id="editNotes" name="notes" value={editingInteraction.notes} onChange={(e) => setEditingInteraction({ ...editingInteraction, notes: e.target.value })} className="col-span-3" />
              </div>
            </div>
          )}
          <Button onClick={handleUpdateInteraction}>Update Interaction</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

