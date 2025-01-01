"""Schema definitions for PostgreSQL models."""

from enum import Enum
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, date, time

class Role(str, Enum):
    """Enumeration of user roles."""
    ADMIN = 'admin'
    SALES =  'sales'
    VIEWER = 'viewer'

class User(BaseModel):
    """Represents a user with basic details."""
    username: str
    email: str
    role: Role
    full_name: str
    class config:
        from_attributes = True

class UserCreate(User):
    """Model for creating a new user."""
    password: str

class UserList(User):
    """Model for listing users with creation details."""
    created_at: datetime

class Lead(BaseModel):
    """Represents a sales lead."""
    name: str
    status : Optional[str] = 'New'

    class config:
        from_attributes = True

class LeadCreateUpdate(Lead):
    """Model for creating or updating a lead."""
    address: str
    zipcode: str
    state : str
    country : str
    timezone : str
    area_of_interest : str

class LeadResponse(LeadCreateUpdate):
    """Model for listing leads with ID and creation date."""
    id: int
    created_at: date   

class POC(BaseModel):
    """Represents a point of contact for a lead."""
    lead_id: int
    name: str
    role: str
    email: str
    phone_number: int
    class config:
        from_attributes = True

class POCList(POC):
    """Model for listing POCs with IDs."""
    id: int

class CallBase(BaseModel):
    """Base model for lead call information."""
    lead_id: int

    class Config:
        from_attributes = True

class CallCreate(CallBase):
    """Model for creating a call schedule."""
    poc_id: int
    frequency: int
    next_call_date: date
    next_call_time: time

class CallUpdate(BaseModel):
    """Model for updating call details."""
    frequency: int

class CallTodayResponse(CallCreate):
    """Response model for today's calls."""
    id: int
    lead_name: str
    poc_name: str
    poc_contact: int

    

