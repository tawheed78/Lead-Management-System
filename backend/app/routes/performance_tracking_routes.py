from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter,Depends
from ..utils.utils import has_permission
from ..models.mongo_models import Interaction, Performance
from ..configs.database.mongo_db import db_instance
from ..configs.database.postgres_db import get_postgres_db
from sqlalchemy.orm import Session
from ..models.postgres_models import LeadModel


router = APIRouter()

db_instance.set_collection("interaction_tracking_collection")
collection = db_instance.get_collection()

start_date = datetime.now() - timedelta(days=30)

well_performing_pipeline = [
    {
        "$match": {
            "interaction_date": {"$gte": start_date}
        }
    },
    {
        "$project": {
            "lead_id": 1,
            "order_values": {
                "$map": {
                    "input": "$order",
                    "as": "item",
                    "in": {
                        "$multiply": [
                            {"$toDouble": {"$ifNull": ["$$item.price", 0]}},
                            {"$toDouble": {"$ifNull": ["$$item.quantity", 0]}}
                        ]
                    }
                }
            },
            "interaction_date": 1
        }
    },
    {
        "$group": {
            "_id": "$lead_id",
            "order_count": {"$sum": {"$size": "$order_values"}},
            "total_order_value": {"$sum": {"$reduce": {"input": "$order_values", "initialValue": 0, "in": {"$add": ["$$value", "$$this"]}}}},  # Sum of order values
            "avg_order_value": {"$avg": {"$reduce": {"input": "$order_values", "initialValue": 0, "in": {"$add": ["$$value", "$$this"]}}}},  # Average order value
            "last_interaction_date": {"$max": "$interaction_date"}
        }
    },
    {
        "$sort": {"order_count": -1}
    }
]

under_performing_pipeline = [
    {
        "$match": {
            "interaction_date": {"$gte": start_date}
        }
    },
    {
        "$project": {
            "lead_id": 1,
            "order_values": {
                "$map": {
                    "input": "$order",
                    "as": "item",
                    "in": {
                        "$cond": {
                            "if": {
                                "$and": [
                                    {"$isNumber": "$$item.price"},
                                    {"$isNumber": "$$item.quantity"}
                                ]
                            },
                            "then": {
                                "$multiply": [
                                    {"$toDouble": "$$item.price"},
                                    {"$toDouble": "$$item.quantity"}
                                ]
                            },
                            "else": 0
                        }
                    }
                }
            },
            "interaction_date": 1
        }
    },
    {
        "$match": {
            "order_values": {"$ne": []}
        }
    },
    {
        "$group": {
            "_id": "$lead_id",
            "order_count": {"$sum": {"$size": "$order_values"}},
            "total_order_value": {"$sum": "$order_values"},
            "avg_order_value": {"$avg": "$order_values"},
            "last_interaction_date": {"$max": "$interaction_date"}
        }
    },
    {
        "$sort": {
            "total_order_value": 1,  # Ascending sort by total order value (lower values come first)
            "avg_order_value": 1,  # Ascending sort by average order value
            "order_count": 1,  # Ascending sort by order count (fewer orders come first)
            "last_interaction_date": 1  # Ascending sort by last interaction date (older interactions come first)
        }
    }
]

async def get_performance_data(pipeline, db: Session):
    performance_data = await collection.aggregate(pipeline).to_list(length=100)
    lead_ids = [performance['_id'] for performance in performance_data]
    leads = db.query(LeadModel).filter(LeadModel.id.in_(lead_ids)).all()
    lead_dict = {lead.id: lead.name for lead in leads}

    response_data = []
    for performance in performance_data:
        response_data.append({
            "id": performance["_id"],
            "order_count": performance["order_count"],
            "total_order_value": performance["total_order_value"],
            "avg_order_value": performance["avg_order_value"],
            "last_interaction_date": performance["last_interaction_date"],
            "lead_name": lead_dict.get(performance["_id"], "Unknown"),
        })
    return response_data

@router.get('/well-performing', response_model=List[dict])
async def get_well_performing(permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    return await get_performance_data(well_performing_pipeline, db)



@router.get('/under-performing', response_model=List[dict])
async def get_performance( permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    performance_data = await collection.aggregate(under_performing_pipeline).to_list(length=100)
    lead_ids = [performance['_id'] for performance in performance_data]
    leads = db.query(LeadModel).filter(LeadModel.id.in_(lead_ids)).all()
    lead_dict = {lead.id: lead.name for lead in leads}

    response_data = []
    for performance in performance_data:
        response_data.append({
            "id": performance["_id"],  # Assuming `Performance` has an `id` field
            "order_count": performance["order_count"],
            "total_order_value": performance["total_order_value"],
            "avg_order_value": performance["avg_order_value"],
            "last_interaction_date": performance["last_interaction_date"],
            "lead_name": lead_dict.get(performance["_id"], "Unknown"),
        })
    return response_data

