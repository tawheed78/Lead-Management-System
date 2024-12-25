from datetime import datetime, timedelta
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from ..models.mongo_models import Interaction
from ..configs.database.mongo_db import db_instance


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
            "interaction_date": {"$gte": start_date}  # Filter interactions from the last 30 days
        }
    },
    {
        "$project": {
            "lead_id": 1,
            "order_values": {
                "$map": {
                    "input": "$order",  # Iterate over each order
                    "as": "item",
                    "in": {
                        "$cond": {  # Ensure that price and quantity are valid numbers
                            "if": {
                                "$and": [
                                    {"$isNumber": "$$item.price"},
                                    {"$isNumber": "$$item.quantity"}
                                ]
                            },
                            "then": {
                                "$multiply": [
                                    {"$toDouble": "$$item.price"},  # Ensure price is numeric
                                    {"$toDouble": "$$item.quantity"}  # Ensure quantity is numeric
                                ]
                            },
                            "else": 0  # If not valid, return 0
                        }
                    }
                }
            },
            "interaction_date": 1
        }
    },
    {
        "$match": {  # Only include documents where order_values is not empty
            "order_values": {"$ne": []}
        }
    },
    {
        "$group": {
            "_id": "$lead_id",  # Group by lead_id
            "order_count": {"$sum": {"$size": "$order_values"}},  # Count the number of items in all orders
            "total_order_value": {"$sum": "$order_values"},  # Sum of order values
            "avg_order_value": {"$avg": "$order_values"},  # Average order value
            "last_interaction_date": {"$max": "$interaction_date"}  # Find the most recent interaction date
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


@router.get('/well-performing', response_model=List[dict])
async def get_performance():
    performance = await collection.aggregate(well_performing_pipeline).to_list(length=1000)
    return performance

@router.get('/under-performing', response_model=List[dict])
async def get_performance():
    performance = await collection.aggregate(under_performing_pipeline).to_list(length=1000)
    return performance

