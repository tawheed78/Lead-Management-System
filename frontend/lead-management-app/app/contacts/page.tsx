'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Contacts() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Doe', role: 'Manager', restaurant: 'Restaurant A', phone: '123-456-7890', email: 'john@restauranta.com' },
    { id: 2, name: 'Jane Smith', role: 'Owner', restaurant: 'Restaurant B', phone: '234-567-8901', email: 'jane@restaurantb.com' },
    { id: 3, name: 'Mike Johnson', role: 'Chef', restaurant: 'Restaurant C', phone: '345-678-9012', email: 'mike@restaurantc.com' },
  ])

  const [newContact, setNewContact] = useState({ name: '', role: '', restaurant: '', phone: '', email: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value })
  }

  const handleAddContact = () => {
    setContacts([...contacts, { id: contacts.length + 1, ...newContact }])
    setNewContact({ name: '', role: '', restaurant: '', phone: '', email: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={newContact.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Input id="role" name="role" value={newContact.role} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="restaurant" className="text-right">Restaurant</Label>
                <Input id="restaurant" name="restaurant" value={newContact.restaurant} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" value={newContact.phone} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" value={newContact.email} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex space-x-4 mb-4">
        <Input placeholder="Search contacts..." className="max-w-sm" />
        <Button variant="outline">Search</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.role}</TableCell>
              <TableCell>{contact.restaurant}</TableCell>
              <TableCell>{contact.phone}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

