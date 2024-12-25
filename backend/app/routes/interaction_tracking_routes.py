from datetime import datetime, timedelta
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..utils.utils import has_permission

from ..models.postgres_models import LeadModel
from ..models.mongo_models import Interaction
from ..configs.database.mongo_db import db_instance
from ..configs.database.postgres_db import get_postgres_db

router = APIRouter()

db_instance.set_collection("interaction_tracking_collection")
collection = db_instance.get_collection()


@router.post('/interactions/{lead_id}', response_model=Interaction)
async def add_interaction(lead_id: int, interaction: Interaction, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales"])):
    interaction = interaction.model_dump()
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    interaction["lead_id"] = lead_id
    interaction["interaction_date"] = datetime.now()
    if interaction.get("order"):
        for order_item in interaction["order"]:
            if not order_item.get("price") or not order_item.get("quantity"):
                raise HTTPException(status_code=400, detail="Price and quantity are required for each order item")
        db_lead.status = "converted"
        db.commit()
        db.refresh(db_lead)
    else:
        db_lead.status = "contacted"
        db.commit()
        db.refresh(db_lead)
    try:
        result = await collection.insert_one(interaction)
        return interaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occurred: {e}")
    

@router.get('/interactions/{lead_id}', response_model=List[Interaction])
async def get_interactions(lead_id: int, permissions: bool = has_permission(["sales", "viewer", "admin"])):
    interactions = await collection.find({"lead_id": lead_id}).to_list(length=1000)
    return interactions


@router.get('/interactions', response_model=List[Interaction])
async def get_all_interactions(permissions: bool = has_permission(["sales", "viewer", "admin"])):
    interactions = await collection.find({}).to_list(length=1000)
    return interactions

# @router.get('/interactions/{interaction_id}', response_model=Interaction)
# async def get_interaction(interaction_id: str):
#     try:
#         print('h')
#         interaction_id = ObjectId(interaction_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid interaction ID format")
#     interaction = await collection.find_one({"_id": interaction_id})
    
#     if interaction is None:
#         raise HTTPException(status_code=404, detail="Interaction not found")
#     return interaction

@router.put('/interactions/{interaction_id}', response_model=Interaction)
async def update_interaction(interaction_id: str, interaction: Interaction, permissions: bool = has_permission(["sales"])):
    interaction = interaction.model_dump()
    try:
        result = await collection.update_one({"_id": ObjectId(interaction_id)}, {"$set": interaction})
        if result.modified_count == 1:
            return interaction
        else:
            raise HTTPException(status_code=404, detail="Interaction not found") 
    except Exception as e:   
        raise HTTPException(status_code=400, detail=f"An error occurred: {e}")
    

@router.delete('/interactions/{interaction_id}', response_model=dict)
async def delete_interaction(interaction_id: str, permissions: bool = has_permission(["admin"])):
    try:
        result = await collection.delete_one({"_id": ObjectId(interaction_id)})    
        if result.deleted_count == 1:
            return {"status": "success", "message": "Interaction deleted"}
        else:
            raise HTTPException(status_code=404, detail="Interaction not found")
    except Exception as e:  
        raise HTTPException(status_code=400, detail=f"An error occurred: {e}")