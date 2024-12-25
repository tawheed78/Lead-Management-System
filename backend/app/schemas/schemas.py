from enum import Enum
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class Role(str, Enum):
    ADMIN = 'admin'
    SALES =  'sales'
    VIEWER = 'viewer'

class User(BaseModel):
    username: str
    email: str
    role: Role
    full_name: str
    class config:
        from_attributes = True

class UserCreate(User):
    password: str

class UserList(User):
    created_at: datetime

class Lead(BaseModel):
    name: str
    status : Optional[str] = 'new'

    class config:
        from_attributes = True

class LeadCreate(Lead):
    address: str
    zipcode: str
    state : str
    country : str
    area_of_interest : str

class LeadList(Lead):
    created_at: datetime
    

class POC(BaseModel):
    lead_id: int
    name: str
    role: str
    email: str
    phone_number: int
    class config:
        from_attributes = True


class CallBase(BaseModel):
    lead_id: int
    frequency: int
    last_call_date: Optional[datetime] = None
    next_call_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class CallCreate(CallBase):
    pass

class CallUpdateFrequency(BaseModel):
    frequency: int

class CallToday(BaseModel):
    lead_id: int
    lead_name: str


