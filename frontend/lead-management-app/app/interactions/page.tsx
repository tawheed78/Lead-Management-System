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

interface Order {
  item: string
  quantity: string
  price: string
}

interface Interaction {
  id: string
  lead_id: string
  lead_name: string
  call_id: string
  interaction_type: string
  interaction_date: string
  order: Order[] 
  interaction_notes: string
}

export default function Interactions() {
  const { user, loading } = useAuth('admin')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [newInteraction, setNewInteraction] = useState<Omit<Interaction, 'id' | 'lead_name'>>({ lead_id: '', call_id: '', interaction_type: '', interaction_date: '', order: [], interaction_notes: '' })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [filterLead, setFilterLead] = useState<string>('all')

  useEffect(() => {
    fetchInteractions()
    fetchLeads()
  }, [])

  const fetchInteractions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:8000/api/interactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setInteractions(data)
        console.log(data)
      } else {
        console.error('Failed to fetch interactions')
      }
    } catch (error) {
      console.error('Error fetching interactions:', error)
    }
  }

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:8000/api/lead', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
        console.log(data)
      } else {
        console.error('Failed to fetch leads')
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewInteraction({ ...newInteraction, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewInteraction({ ...newInteraction, [name]: value })
  }

  const handleAddInteraction = async () => {
    
    const addedInteraction: Interaction = {
      id: String(interactions.length + 1),
      lead_name: leads.find(lead => lead.id === newInteraction.lead_id)?.name || '',
      ...newInteraction
    }
    setInteractions([...interactions, addedInteraction])
    setNewInteraction({ lead_id: '', call_id: '', interaction_type: '', interaction_date: '', order: [], interaction_notes: '' })
    setIsAddModalOpen(false)
  }

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction)
    setIsEditModalOpen(true)
  }

  const handleUpdateInteraction = async () => {
    if (editingInteraction) {
      
      const updatedInteractions = interactions.map(interaction => 
        interaction.id === editingInteraction.id ? editingInteraction : interaction
      )
      setInteractions(updatedInteractions)
      setIsEditModalOpen(false)
      setEditingInteraction(null)
    }
  }

  const handleDeleteInteraction = async (id: string) => {
   
    const updatedInteractions = interactions.filter(interaction => interaction.id !== id)
    setInteractions(updatedInteractions)
  }

  const filteredInteractions = filterLead === 'all' || filterLead === ''
    ? interactions
    : interactions.filter(interaction => interaction.lead_id === filterLead)

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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interaction_type" className="text-right">Type</Label>
                <Select onValueChange={(value) => handleSelectChange('interaction_type', value)}>
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
                <Label htmlFor="interaction_date" className="text-right">Date</Label>
                <Input id="interaction_date" name="interaction_date" type="date" value={newInteraction.interaction_date} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interaction_notes" className="text-right">Notes</Label>
                <Input id="interaction_notes" name="interaction_notes" value={newInteraction.interaction_notes} onChange={handleInputChange} className="col-span-3" />
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
            <SelectItem value="all">All Leads</SelectItem>
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
              <TableCell>{interaction.lead_name}</TableCell>
              <TableCell>{interaction.interaction_type}</TableCell>
              <TableCell>{interaction.interaction_date}</TableCell>
              <TableCell>{interaction.interaction_notes}</TableCell>
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
                <Select onValueChange={(value) => setEditingInteraction({ ...editingInteraction, lead_id: value, lead_name: leads.find(lead => lead.id === value)?.name || '' })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={editingInteraction.lead_name} />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editInteractionType" className="text-right">Type</Label>
                <Select onValueChange={(value) => setEditingInteraction({ ...editingInteraction, interaction_type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={editingInteraction.interaction_type} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editInteractionDate" className="text-right">Date</Label>
                <Input id="editInteractionDate" name="interaction_date" type="date" value={editingInteraction.interaction_date} onChange={(e) => setEditingInteraction({ ...editingInteraction, interaction_date: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editInteractionNotes" className="text-right">Notes</Label>
                <Input id="editInteractionNotes" name="interaction_notes" value={editingInteraction.interaction_notes} onChange={(e) => setEditingInteraction({ ...editingInteraction, interaction_notes: e.target.value })} className="col-span-3" />
              </div>
            </div>
          )}
          <Button onClick={handleUpdateInteraction}>Update Interaction</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}