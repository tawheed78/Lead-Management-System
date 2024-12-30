"Model Configuration Module for MongoDB"

from typing import List, Optional
from enum import Enum
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel


class FollowUp(str, Enum):
    "Enum Class for follow-up status"
    YES = "Yes"
    NO = "No"

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

class Order(BaseModel):
    "Order Model"
    item: str
    quantity: int
    price: float


class Interaction(BaseModel):
    "Interaction Model"
    lead_id: int
    call_id: Optional[int] = None
    interaction_type: InteractionType
    interaction_date: str
    order: Optional[List[Order]] = None
    interaction_notes: Optional[str] = None
    follow_up: FollowUp
    class Config:
        "Pydantic Configuration"
        json_encoders = {
            ObjectId: str,  # Convert ObjectId to string for serialization
        }

class InteractionResponse(Interaction):
    id: str
    lead_name: str

class Performance(BaseModel):
    id: int
    order_count: int
    total_order_value: float
    avg_order_value: float
    last_interaction_date: str
    lead_name: str