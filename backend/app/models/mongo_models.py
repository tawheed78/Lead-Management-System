from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class FollowUp(str, Enum):
    YES = "Yes"
    NO = "No"

class InteractionType(str, Enum):
    CALL = "Call"
    EMAIL = "Email"
    MEETING = "Meeting"
    ORDER_PLACEMENT = "Order Placement"
    ORDER_FOLLOW_UP = "Order Follow-up"
    ORDER_CANCELLATION = "Order Cancellation"
    ORDER_REFUND = "Order Refund"
    ORDER_RETURN = "Order Return"
    ORDER_EXCHANGE = "Order Exchange"
    ORDER_STATUS = "Order Status"
    ORDER_PAYMENT = "Order Payment"
    ORDER_DELIVERY = "Order Delivery"
    OTHER = "Other"

class Order(BaseModel):
    item: str
    quantity: int
    price: float


class Interaction(BaseModel):
    lead_id: int
    call_id: Optional[int] = None
    interaction_type: InteractionType
    interaction_date: datetime
    order: Optional[List[Order]] = None
    interaction_notes: Optional[str] = None
    follow_up: FollowUp
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str,  # Convert ObjectId to string for serialization
        }
