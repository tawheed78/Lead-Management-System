from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class Lead(BaseModel):
    name: str
    status : Optional[str] = 'new'

    class config:
        from_attributes = True

class POC(BaseModel):
    lead_id: int
    name: str
    role: str
    email: str
    phone_number: int
    class config:
        from_attributes = True
    # class Config:
    #     orm_mode = True

class CallBase(BaseModel):
    lead_id: int
    frequency: int
    last_call_date: datetime

    class Config:
        orm_mode = True

class CallCreate(CallBase):
    pass

class CallUpdateFrequency(BaseModel):
    frequency: int

class CallToday(BaseModel):
    lead_id: int
    last_call_date: datetime


