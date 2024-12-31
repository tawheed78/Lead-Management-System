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
  status: string
  address: string
  zipcode: string
  state: string
  country: string
  timezone: string
  area_of_interest: string
  created_at: string
}

interface PointOfContact {
  id: string
  lead_id: string
  name: string
  role: string
  email: string
  phone_number: string
}

export default function Leads() {
  // const { user, loading } = useAuth('admin')
  const { loading } = useAuth('admin')
  const [leads, setLeads] = useState<Lead[]>([])
  const [newLead, setNewLead] = useState<Omit<Lead, 'id'>>({ name: '', status: '', address: '', zipcode: '', state: '', country: '', timezone: '', area_of_interest: '', created_at: '' })
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isPocModalOpen, setIsPocModalOpen] = useState(false)
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)
  const [pointsOfContact, setPointsOfContact] = useState<PointOfContact[]>([])
  const [newPoc, setNewPoc] = useState<Omit<PointOfContact, 'id' | 'lead_id'>>({ name: '', role: '', email: '', phone_number: '' })
  
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const leadsResponse = await fetch('http://127.0.0.1:8000/api/lead', {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json()
        setLeads(leadsData) 
      } else {
          throw new Error('Failed to fetch dashboard data')
        }
    }catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  const fetchPointsOfContact = async (leadId: string) => {
    try {
      const pointsOfContactResponse = await fetch(`http://127.0.0.1:8000/api/lead/${leadId}/pocs`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })
      if (pointsOfContactResponse.ok) {
        const pointsOfContactData = await pointsOfContactResponse.json()
        setPointsOfContact(pointsOfContactData)
        console.log('Leads data:', pointsOfContactData) 
      } else {
          throw new Error('Failed to fetch dashboard data')
        }
    }catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLead({ ...newLead, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewLead({ ...newLead, [name]: value })
  }

  const handleAddLead = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLead),
      })
  
      if (response.ok) {
        const addedLead: Lead = await response.json()
        setLeads([...leads, addedLead])
        setNewLead({ name: '', status: '', address: '', zipcode: '', state: '', country: '', timezone: '', area_of_interest: '', created_at: '' })
        setIsAddLeadModalOpen(false)
        // window.location.reload()
      } else {
        console.error('Failed to add lead')
      }
    } catch (error) {
      console.error('Error adding lead:', error)
    }
  }

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setIsEditLeadModalOpen(true)
  }

  const handleUpdateLead = async () => {
    if (editingLead) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/lead/${editingLead.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingLead),
        })
  
        if (response.ok) {
          const updatedLead = await response.json()
          const updatedLeads = leads.map(lead => 
            lead.id === updatedLead.id ? updatedLead : lead
          )
          setLeads(updatedLeads)
          setIsEditLeadModalOpen(false)
          setEditingLead(null)
        } else {
          console.error('Failed to update lead')
        }
      } catch (error) {
        console.error('Error updating lead:', error)
      }
    }
  }

  const handleDeleteLead = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/lead/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      if (response.ok) {
        const updatedLeads = leads.filter(lead => lead.id !== id)
        setLeads(updatedLeads)
      } else {
        console.error('Failed to delete lead')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const handleOpenPocModal = async (leadId: string) => {
    setCurrentLeadId(leadId)
    setIsPocModalOpen(true)
    await fetchPointsOfContact(leadId)
  }
  const handleAddPoc = async () => {
    if (currentLeadId) {
      try {
        console.log('currentLeadId:', currentLeadId)
        const response = await fetch(`http://127.0.0.1:8000/api/lead/${currentLeadId}/poc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({...newPoc, lead_id: currentLeadId}),
        })
  
        if (response.ok) {
          const addedPoc = await response.json()
          setPointsOfContact([...pointsOfContact, addedPoc])
          setNewPoc({ name: '', role: '', email: '', phone_number: '' })
          setIsPocModalOpen(false)
        } else {
          console.error('Failed to add point of contact')
        }
      } catch (error) {
        console.error('Error adding point of contact:', error)
      }
    }
  }
  const handleDeletePoc = async (pocId: string) => {
    if (currentLeadId) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/lead/${currentLeadId}/poc/${pocId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
    
        if (response.ok) {
          const updatedPocs = pointsOfContact.filter(poc => poc.id !== pocId)
          setPointsOfContact(updatedPocs)
        } else {
          console.error('Failed to delete point of contact')
        }
      } catch (error) {
        console.error('Error deleting point of contact:', error)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Leads</h2>
        <Dialog open={isAddLeadModalOpen} onOpenChange={setIsAddLeadModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={newLead.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="area_of_interest" className="text-right">Industry</Label>
                <Input id="area_of_interest" name="area_of_interest" value={newLead.area_of_interest} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Address</Label>
                <Input id="address" name="address" value={newLead.address} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zipcode" className="text-right">Zipcode</Label>
                <Input id="zipcode" name="zipcode" value={newLead.zipcode} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">State</Label>
                <Input id="state" name="state" value={newLead.state} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">Country</Label>
                <Input id="country" name="country" value={newLead.country} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timezone" className="text-right">Timezone</Label>
                <Input id="timezone" name="timezone" value={newLead.timezone} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="created_at" className="text-right">Created At</Label>
                <Input id="created_at" name="created_at" type="date" value={newLead.created_at} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <Button onClick={handleAddLead}>Add Lead</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Zipcode</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Timezone</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.status}</TableCell>
              <TableCell>{lead.area_of_interest}</TableCell>
              <TableCell>{lead.address}</TableCell>
              <TableCell>{lead.zipcode}</TableCell>
              <TableCell>{lead.state}</TableCell>
              <TableCell>{lead.country}</TableCell>
              <TableCell>{lead.timezone}</TableCell>
              <TableCell>{lead.created_at}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditLead(lead)}>Edit</Button>
                <Button variant="destructive" size="sm" className="mr-2" onClick={() => handleDeleteLead(lead.id)}>Delete</Button>
                <Button variant="secondary" size="sm" onClick={() => handleOpenPocModal(lead.id)}>Manage POCs</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isEditLeadModalOpen} onOpenChange={setIsEditLeadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {editingLead && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">Name</Label>
                <Input id="editName" name="name" value={editingLead.name} onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStatus" className="text-right">Status</Label>
                <Select onValueChange={(value) => setEditingLead({ ...editingLead, status: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={editingLead.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editIndustry" className="text-right">Industry</Label>
                <Input id="editIndustry" name="industry" value={editingLead.area_of_interest} onChange={(e) => setEditingLead({ ...editingLead, area_of_interest: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editAddress" className="text-right">Address</Label>
                <Input id="editAddress" name="address" value={editingLead.address} onChange={(e) => setEditingLead({ ...editingLead, address: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editZipcode" className="text-right">Zipcode</Label>
                <Input id="editZipcode" name="zipcode" value={editingLead.zipcode} onChange={(e) => setEditingLead({ ...editingLead, zipcode: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editState" className="text-right">State</Label>
                <Input id="editState" name="state" value={editingLead.state} onChange={(e) => setEditingLead({ ...editingLead, state: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editCountry" className="text-right">Country</Label>
                <Input id="editCountry" name="country" value={editingLead.country} onChange={(e) => setEditingLead({ ...editingLead, country: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTimezone" className="text-right">Timezone</Label>
                <Input id="editTimezone" name="timezone" value={editingLead.timezone} onChange={(e) => setEditingLead({ ...editingLead, timezone: e.target.value })} className="col-span-3" />
              </div>
            </div>
          )}
          <Button onClick={handleUpdateLead}>Update Lead</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isPocModalOpen} onOpenChange={setIsPocModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Points of Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pocName" className="text-right">Name</Label>
                <Input id="pocName" name="name" value={newPoc.name} onChange={(e) => setNewPoc({ ...newPoc, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pocRole" className="text-right">Role</Label>
                <Input id="pocRole" name="role" value={newPoc.role} onChange={(e) => setNewPoc({ ...newPoc, role: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pocEmail" className="text-right">Email</Label>
                <Input id="pocEmail" name="email" type="email" value={newPoc.email} onChange={(e) => setNewPoc({ ...newPoc, email: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pocPhone" className="text-right">Phone</Label>
                <Input id="pocPhone" name="phone_number" value={newPoc.phone_number} onChange={(e) => setNewPoc({ ...newPoc, phone_number: e.target.value })} className="col-span-3" />
              </div>
            </div>
            <Button onClick={handleAddPoc}>Add Point of Contact</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              
              {pointsOfContact.filter(poc => poc.lead_id === currentLeadId).map((poc) => (
                <TableRow key={poc.id}>
                  <TableCell>{poc.name}</TableCell>
                  <TableCell>{poc.role}</TableCell>
                  <TableCell>{poc.email}</TableCell>
                  <TableCell>{poc.phone_number}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePoc(poc.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  )
}