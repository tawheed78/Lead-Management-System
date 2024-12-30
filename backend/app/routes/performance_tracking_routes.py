from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter,Depends
from ..utils.utils import has_permission, convert_to_date_and_time
from ..models.mongo_models import Performance
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
        "$match": {
            "order_count": {"$gt": 0} 
        }
    },
    {
        "$sort": {
            "order_count": 1,
            "total_order_value": 1,
            "last_interaction_date": 1 
        }
    }
]


Total_data_pipeline = [
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
        "$match": {
            "order_values": {"$ne": []}
        }
    },
    {
        "$group": {
            "_id": "$lead_id",
            "order_count": {"$sum": {"$size": "$order_values"}},
            "total_order_value": {"$sum": {"$reduce": {"input": "$order_values", "initialValue": 0, "in": {"$add": ["$$value", "$$this"]}}}},
            "avg_order_value": {"$avg": {"$reduce": {"input": "$order_values", "initialValue": 0, "in": {"$add": ["$$value", "$$this"]}}}},
            "last_interaction_date": {"$max": "$interaction_date"}
        }
    }
]





async def get_performance_data(pipeline, db: Session, limit):
    performance_data = await collection.aggregate(pipeline).to_list(length=limit)
    lead_ids = [performance['_id'] for performance in performance_data]
    leads = db.query(LeadModel).filter(LeadModel.id.in_(lead_ids)).all()
    lead_dict = {lead.id: lead.name for lead in leads}
    response_data = []
    for performance in performance_data:
        datetime_object = performance["last_interaction_date"]
        datetime_object = convert_to_date_and_time(datetime_object)
        response_data.append({
            "id": performance["_id"],
            "order_count": performance["order_count"],
            "total_order_value": performance["total_order_value"],
            "avg_order_value": performance["avg_order_value"],
            "last_interaction_date": datetime_object,
            "lead_name": lead_dict.get(performance["_id"], "Unknown"),
        })
    return response_data

@router.get('/well-performing', response_model=List[Performance])
async def well_performance(permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    return await get_performance_data(well_performing_pipeline, db, limit=5)

@router.get('/', response_model=List[dict])
async def performance(permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    return await get_performance_data(Total_data_pipeline, db, limit=100)

@router.get('/under-performing', response_model=List[Performance])
async def under_performance(permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    return await get_performance_data(under_performing_pipeline, db, limit=5)
