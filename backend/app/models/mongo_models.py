"Model Configuration Module for MongoDB"

from datetime import datetime
from typing import List, Optional
from enum import Enum
from bson import ObjectId
from pydantic import BaseModel


class FollowUp(str, Enum):
    "Enum Class for follow-up status"
    YES = "Yes"
    NO = "No"

class Order(BaseModel):
    "Order Model"
    item: str
    quantity: int
    price: float

class InteractionType(str, Enum):
    "Enum Class for interaction type"
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

class Interaction(BaseModel):
    "Interaction Model"
    lead_id: int
    call_id: Optional[int] = None
    interaction_type: InteractionType
    order: Optional[List[Order]] = None
    interaction_notes: Optional[str] = None
    follow_up: FollowUp
    class Config:
        "Pydantic Configuration"
        json_encoders = {
            ObjectId: str,
        }

class AddUpdateInteraction(Interaction):
    """Add/Update Interaction Model"""
    interaction_date: datetime

class InteractionResponse(Interaction):
    """Interaction Response Model"""
    id: str
    lead_name: str
    interaction_date: str
    

class Performance(BaseModel):
    """Performance Model"""
    id: int
    order_count: int
    total_order_value: float
    avg_order_value: float
    last_interaction_date: str
    lead_name: str