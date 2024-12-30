import os
from dotenv import load_dotenv
from ..utils.utils import convert_to_date_and_time
from ..configs.database.mongo_db import mongo_db
from sqlalchemy.orm import Session
from ..models.postgres_models import LeadModel

load_dotenv(dotenv_path="app/.env")

INTERACTION_COLLECTION = os.getenv('INTERACTION_COLLECTION')
mongo_db.set_collection(INTERACTION_COLLECTION)
collection = mongo_db.get_collection()

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

