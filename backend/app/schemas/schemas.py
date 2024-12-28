from enum import Enum
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, date, time

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
    status : Optional[str] = 'New'

    class config:
        from_attributes = True

class LeadCreateUpdate(Lead):
    address: str
    zipcode: str
    state : str
    country : str
    timezone : str = 'Asia/Kolkata'
    area_of_interest : str

class LeadList(LeadCreateUpdate):
    id: int
    created_at: date   

class POC(BaseModel):
    lead_id: int
    name: str
    role: str
    email: str
    phone_number: int
    class config:
        from_attributes = True

class POCList(POC):
    id: int

class CallBase(BaseModel):

    lead_id: int

    class Config:
        from_attributes = True

class CallCreate(CallBase):
    poc_id: int
    frequency: int
    next_call_date: date
    next_call_time: time

class CallUpdateFrequency(BaseModel):
    frequency: int

class CallTodayResponse(CallCreate):
    id: int
    lead_name: str
    poc_name: str
    poc_contact: int
    
    

