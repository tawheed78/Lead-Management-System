'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FaTrash, FaEdit, FaEye } from 'react-icons/fa';

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

interface AddInteraction {
  id: string
  lead_id: string
  lead_name: string
  interaction_type: string
  interaction_date: string
  order: Order[] 
  interaction_notes: string
  follow_up: string
}

export default function Interactions() {
  // const { user, loading } = useAuth('admin')
  const {loading } = useAuth('admin')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [newInteraction, setNewInteraction] = useState<Omit<AddInteraction, 'id' | 'lead_name'>>({ lead_id: '', interaction_type: '', interaction_date: '', order: [], interaction_notes: '', follow_up: '' })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [filterLead, setFilterLead] = useState<string>('all')
  const [viewingInteraction, setViewingInteraction] = useState<Interaction | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

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

  const handleOrderChange = (index: number, name: string, value: string) => {
    const updatedOrders = newInteraction.order.map((order, i) => 
      i === index ? { ...order, [name]: value } : order
    )
    setNewInteraction({ ...newInteraction, order: updatedOrders })
  }

  const addOrderItem = () => {
    setNewInteraction({ ...newInteraction, order: [...newInteraction.order, { item: '', quantity: '', price: '' }] })
  }

  const removeOrderItem = (index: number) => {
    const updatedOrders = newInteraction.order.filter((_, i) => i !== index)
    setNewInteraction({ ...newInteraction, order: updatedOrders })
  }

  const handleViewInteraction = (interaction: Interaction) => {
    setViewingInteraction(interaction)
    setIsViewModalOpen(true)
  }

  const handleAddInteraction = async () => {
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
        const addedInteraction = await response.json()
        setInteractions([...interactions, addedInteraction])
        setNewInteraction({lead_id:'', interaction_type: '', interaction_date: '', order: [], interaction_notes: '', follow_up: '' })
        setIsAddModalOpen(false)
      } else {
        console.error('Failed to add interaction')
      }
    } catch (error) {
      console.error('Error adding Interaction:', error)
    }
  }

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction)
    setIsEditModalOpen(true)
  }

 
  const handleUpdateInteraction = async () => {
    if (editingInteraction) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://127.0.0.1:8000/api/interactions/${editingInteraction.lead_id}/${editingInteraction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingInteraction),
        })
        if (response.ok) {
          const updatedInteraction = await response.json()
          const updatedInteractions = interactions.map(interaction => 
            interaction.id === updatedInteraction.id ? updatedInteraction : interaction
          )
          setInteractions(updatedInteractions)
          setIsEditModalOpen(false)
          setEditingInteraction(null)
        } else {
          console.error('Failed to update interaction')
        }
      } catch (error) {
        console.error('Error updating interaction:', error)
      }
    }
  }


  const handleDeleteInteraction = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://127.0.0.1:8000/api/interactions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const updatedInteractions = interactions.filter(interaction => interaction.id !== id)
        setInteractions(updatedInteractions)
      } else {
        console.error('Failed to delete interaction')
      }
    } catch (error) {
      console.error('Error deleting interaction:', error)
    }
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Orders</Label>
                <Button onClick={addOrderItem} className="col-span-3">Add Order Item</Button>
              </div>
              {newInteraction.order.map((order, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Input placeholder="Item" value={order.item} onChange={(e) => handleOrderChange(index, 'item', e.target.value)} className="col-span-1" />
                  <Input placeholder="Quantity" value={order.quantity} onChange={(e) => handleOrderChange(index, 'quantity', e.target.value)} className="col-span-1" />
                  <Input placeholder="Price" value={order.price} onChange={(e) => handleOrderChange(index, 'price', e.target.value)} className="col-span-1" />
                  <Button variant="destructive" onClick={() => removeOrderItem(index)} className="col-span-1">Remove</Button>
              </div>
              ))}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="follow_up" className="text-right">Follow Up</Label>
                <Select onValueChange={(value) => handleSelectChange('follow_up', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
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
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditInteraction(interaction)}><FaEdit /></Button>
                <Button variant="destructive" size="sm" className='mr-2' onClick={() => handleDeleteInteraction(interaction.id)}><FaTrash /></Button>
                <Button variant="outline" size="sm" className='mr-2' onClick={() => handleViewInteraction(interaction)}><FaEye /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Interaction</DialogTitle>
          </DialogHeader>
          {viewingInteraction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Lead: </Label>
                <div className="col-span-3">{viewingInteraction.lead_name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type: </Label>
                <div className="col-span-3">{viewingInteraction.interaction_type}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date: </Label>
                <div className="col-span-3">{viewingInteraction.interaction_date}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Notes: </Label>
                <div className="col-span-3">{viewingInteraction.interaction_notes}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Orders: </Label>
                <div className="col-span-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingInteraction.order.map((order, index) => (
                        <TableRow key={index}>
                          <TableCell>{order.item}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Orders</Label>
                <Button onClick={() => setEditingInteraction({ ...editingInteraction, order: [...editingInteraction.order, { item: '', quantity: '', price: '' }] })} className="col-span-3">Add Order Item</Button>
              </div>
              {editingInteraction.order.map((order, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Input placeholder="Item" value={order.item} onChange={(e) => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.map((o, i) => i === index ? { ...o, item: e.target.value } : o) })} className="col-span-1" />
                  <Input placeholder="Quantity" value={order.quantity} onChange={(e) => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.map((o, i) => i === index ? { ...o, quantity: e.target.value } : o) })} className="col-span-1" />
                  <Input placeholder="Price" value={order.price} onChange={(e) => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.map((o, i) => i === index ? { ...o, price: e.target.value } : o) })} className="col-span-1" />
                  <Button variant="destructive" onClick={() => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.filter((_, i) => i !== index) })} className="col-span-1">Remove</Button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleUpdateInteraction}>Update Interaction</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}


// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from '@/hooks/useAuth'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { FaTrash, FaEdit, FaPhone, FaEye } from 'react-icons/fa'
// import { fetchInteractions, fetchLeads, addInteraction, updateInteraction, deleteInteraction, Interaction, AddInteraction, Lead, Order } from '@/services/interactions/interactionsService'

// export default function Interactions() {
//   const { user, loading } = useAuth('admin')
//   const [interactions, setInteractions] = useState<Interaction[]>([])
//   const [leads, setLeads] = useState<Lead[]>([])
//   const [newInteraction, setNewInteraction] = useState<Omit<AddInteraction, 'id' | 'lead_name'>>({ lead_id: '', interaction_type: '', interaction_date: '', order: [], interaction_notes: '', follow_up: '' })
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
//   const [filterLead, setFilterLead] = useState<string>('all')
//   const [viewingInteraction, setViewingInteraction] = useState<Interaction | null>(null)
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false)

//   useEffect(() => {
//     fetchInteractionsData()
//     fetchLeadsData()
//   }, [])

//   const fetchInteractionsData = async () => {
//     const data = await fetchInteractions()
//     setInteractions(data)
//   }

//   const fetchLeadsData = async () => {
//     const data = await fetchLeads()
//     setLeads(data)
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewInteraction({ ...newInteraction, [e.target.name]: e.target.value })
//   }

//   const handleSelectChange = (name: string, value: string) => {
//     setNewInteraction({ ...newInteraction, [name]: value })
//   }

//   const handleOrderChange = (index: number, name: string, value: string) => {
//     const updatedOrders = newInteraction.order.map((order, i) => 
//       i === index ? { ...order, [name]: value } : order
//     )
//     setNewInteraction({ ...newInteraction, order: updatedOrders })
//   }

//   const addOrderItem = () => {
//     setNewInteraction({ ...newInteraction, order: [...newInteraction.order, { item: '', quantity: '', price: '' }] })
//   }

//   const removeOrderItem = (index: number) => {
//     const updatedOrders = newInteraction.order.filter((_, i) => i !== index)
//     setNewInteraction({ ...newInteraction, order: updatedOrders })
//   }

//   const handleViewInteraction = (interaction: Interaction) => {
//     setViewingInteraction(interaction)
//     setIsViewModalOpen(true)
//   }

//   const handleAddInteraction = async () => {
//     const interactionWithDefaults = {
//       ...newInteraction,
//       id: '', // or generate a temporary unique identifier if needed
//       lead_name: leads.find((lead) => lead.id === newInteraction.lead_id)?.name || '',
//     };

//   const addedInteraction = await addInteraction(interactionWithDefaults);
//   if (addedInteraction) {
//     setInteractions([...interactions, addedInteraction]);
//     setNewInteraction({
//       lead_id: '',
//       interaction_type: '',
//       interaction_date: '',
//       order: [],
//       interaction_notes: '',
//       follow_up: '',
//     });
//     setIsAddModalOpen(false);
//   }
// };

//   const handleEditInteraction = (interaction: Interaction) => {
//     setEditingInteraction(interaction)
//     setIsEditModalOpen(true)
//   }

//   const handleUpdateInteraction = async () => {
//     if (editingInteraction) {
//       const updatedInteraction = await updateInteraction(editingInteraction)
//       if (updatedInteraction) {
//         const updatedInteractions = interactions.map(interaction => 
//           interaction.id === updatedInteraction.id ? updatedInteraction : interaction
//         )
//         setInteractions(updatedInteractions)
//         setIsEditModalOpen(false)
//         setEditingInteraction(null)
//       }
//     }
//   }

//   const handleDeleteInteraction = async (id: string) => {
//     const success = await deleteInteraction(id)
//     if (success) {
//       const updatedInteractions = interactions.filter(interaction => interaction.id !== id)
//       setInteractions(updatedInteractions)
//     }
//   }

//   const filteredInteractions = filterLead === 'all' || filterLead === ''
//     ? interactions
//     : interactions.filter(interaction => interaction.lead_id === filterLead)

//   if (loading) {
//     return <div>Loading...</div>
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800">Interactions</h2>
//         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//           <DialogTrigger asChild>
//             <Button>Add New Interaction</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add New Interaction</DialogTitle>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="lead_id" className="text-right">Lead</Label>
//                 <Select onValueChange={(value) => handleSelectChange('lead_id', value)}>
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder="Select lead" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {leads.map((lead) => (
//                       <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="interaction_type" className="text-right">Type</Label>
//                 <Select onValueChange={(value) => handleSelectChange('interaction_type', value)}>
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder="Select type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="call">Call</SelectItem>
//                     <SelectItem value="email">Email</SelectItem>
//                     <SelectItem value="meeting">Meeting</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="interaction_date" className="text-right">Date</Label>
//                 <Input id="interaction_date" name="interaction_date" type="date" value={newInteraction.interaction_date} onChange={handleInputChange} className="col-span-3" />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="interaction_notes" className="text-right">Notes</Label>
//                 <Input id="interaction_notes" name="interaction_notes" value={newInteraction.interaction_notes} onChange={handleInputChange} className="col-span-3" />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="follow_up" className="text-right">Follow Up</Label>
//                 <Input id="follow_up" name="follow_up" value={newInteraction.follow_up} onChange={handleInputChange} className="col-span-3" />
//               </div>
//               {newInteraction.order.map((order, index) => (
//                 <div key={index} className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor={`item-${index}`} className="text-right">Item</Label>
//                   <Input id={`item-${index}`} name="item" value={order.item} onChange={(e) => handleOrderChange(index, 'item', e.target.value)} className="col-span-1" />
//                   <Label htmlFor={`quantity-${index}`} className="text-right">Quantity</Label>
//                   <Input id={`quantity-${index}`} name="quantity" value={order.quantity} onChange={(e) => handleOrderChange(index, 'quantity', e.target.value)} className="col-span-1" />
//                   <Label htmlFor={`price-${index}`} className="text-right">Price</Label>
//                   <Input id={`price-${index}`} name="price" value={order.price} onChange={(e) => handleOrderChange(index, 'price', e.target.value)} className="col-span-1" />
//                   <Button onClick={() => removeOrderItem(index)} variant="destructive">Remove</Button>
//                 </div>
//               ))}
//               <Button onClick={addOrderItem}>Add Order Item</Button>
//             </div>
//             <Button onClick={handleAddInteraction}>Add Interaction</Button>
//           </DialogContent>
//         </Dialog>
//       </div>
//       <div className="flex space-x-4 mb-4">
//         <Select onValueChange={setFilterLead}>
//           <SelectTrigger className="w-[200px]">
//             <SelectValue placeholder="Filter by lead" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Leads</SelectItem>
//             {leads.map((lead) => (
//               <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Lead</TableHead>
//             <TableHead>Type</TableHead>
//             <TableHead>Date</TableHead>
//             <TableHead>Notes</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {filteredInteractions.map((interaction) => (
//             <TableRow key={interaction.id}>
//               <TableCell>{interaction.lead_name}</TableCell>
//               <TableCell>{interaction.interaction_type}</TableCell>
//               <TableCell>{interaction.interaction_date}</TableCell>
//               <TableCell>{interaction.interaction_notes}</TableCell>
//               <TableCell>
//                 <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditInteraction(interaction)}>
//                   <FaEdit />
//                 </Button>
//                 <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewInteraction(interaction)}>
//                   <FaEye />
//                 </Button>
//                 <Button variant="destructive" size="sm" onClick={() => handleDeleteInteraction(interaction.id)}>
//                   <FaTrash />
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Interaction</DialogTitle>
//           </DialogHeader>
//            {editingInteraction && (
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="editLeadId" className="text-right">Lead</Label>
//                 <Select onValueChange={(value) => setEditingInteraction({ ...editingInteraction, lead_id: value, lead_name: leads.find(lead => lead.id === value)?.name || '' })}>
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder={editingInteraction.lead_name} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {leads.map((lead) => (
//                       <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="editInteractionType" className="text-right">Type</Label>
//                 <Select onValueChange={(value) => setEditingInteraction({ ...editingInteraction, interaction_type: value })}>
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder={editingInteraction.interaction_type} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Call">Call</SelectItem>
//                     <SelectItem value="Email">Email</SelectItem>
//                     <SelectItem value="Meeting">Meeting</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="editInteractionDate" className="text-right">Date</Label>
//                 <Input id="editInteractionDate" name="interaction_date" type="date" value={editingInteraction.interaction_date} onChange={(e) => setEditingInteraction({ ...editingInteraction, interaction_date: e.target.value })} className="col-span-3" />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="editInteractionNotes" className="text-right">Notes</Label>
//                 <Input id="editInteractionNotes" name="interaction_notes" value={editingInteraction.interaction_notes} onChange={(e) => setEditingInteraction({ ...editingInteraction, interaction_notes: e.target.value })} className="col-span-3" />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right">Orders</Label>
//                 <Button onClick={() => setEditingInteraction({ ...editingInteraction, order: [...editingInteraction.order, { item: '', quantity: '', price: '' }] })} className="col-span-3">Add Order Item</Button>
//               </div>
//               {editingInteraction.order.map((order, index) => (
//                 <div key={index} className="grid grid-cols-4 items-center gap-4">
//                   <Input placeholder="Item" value={order.item} onChange={(e) => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.map((o, i) => i === index ? { ...o, item: e.target.value } : o) })} className="col-span-1" />
//                   <Input placeholder="Quantity" value={order.quantity} onChange={(e) => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.map((o, i) => i === index ? { ...o, quantity: e.target.value } : o) })} className="col-span-1" />
//                   <Input placeholder="Price" value={order.price} onChange={(e) => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.map((o, i) => i === index ? { ...o, price: e.target.value } : o) })} className="col-span-1" />
//                   <Button variant="destructive" onClick={() => setEditingInteraction({ ...editingInteraction, order: editingInteraction.order.filter((_, i) => i !== index) })} className="col-span-1">Remove</Button>
//                 </div>
//               ))}
//             </div>
//           )}
//           <Button onClick={handleUpdateInteraction}>Update Interaction</Button>
//         </DialogContent>
//       </Dialog>
//       <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>View Interaction</DialogTitle>
//           </DialogHeader>
//           {viewingInteraction && (
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="viewLeadId" className="text-right">Lead</Label>
//                 <p className="col-span-3">{viewingInteraction.lead_name}</p>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="viewType" className="text-right">Type</Label>
//                 <p className="col-span-3">{viewingInteraction.interaction_type}</p>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="viewDate" className="text-right">Date</Label>
//                 <p className="col-span-3">{viewingInteraction.interaction_date}</p>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="viewNotes" className="text-right">Notes</Label>
//                 <p className="col-span-3">{viewingInteraction.interaction_notes}</p>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="viewFollowUp" className="text-right">Follow Up</Label>
//                 <p className="col-span-3">{viewingInteraction.follow_up}</p>
//               </div>
//             </div>
//           )}
//           <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

