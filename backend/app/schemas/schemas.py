from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class Lead(BaseModel):
    name: str
    status : Optional[str] = 'new'

    class config:
        from_attributes = True

class LeadCreate(Lead):
    pass

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


