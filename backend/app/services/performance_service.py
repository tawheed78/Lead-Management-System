"""This module contains functions for retrieving performance data from MongoDB."""

import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ..configs.database.mongo_db import mongo_db
from ..models.postgres_models import LeadModel

load_dotenv(dotenv_path="app/.env")

# Set the MongoDB collection to use
INTERACTION_COLLECTION = os.getenv('INTERACTION_COLLECTION')
mongo_db.set_collection(INTERACTION_COLLECTION)
collection = mongo_db.get_collection()

async def get_performance_data(pipeline, db: Session, limit):
    """Retrieve performance data using a MongoDB aggregation pipeline."""
    performance_data = await collection.aggregate(pipeline).to_list(length=limit)
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
