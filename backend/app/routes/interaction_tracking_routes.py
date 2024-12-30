import os
from dotenv import load_dotenv
from datetime import datetime
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..utils.utils import convert_to_date_and_time, has_permission
from ..models.postgres_models import LeadModel
from ..models.mongo_models import Interaction, InteractionResponse, AddUpdateInteraction
from ..configs.database.mongo_db import mongo_db
from ..configs.database.postgres_db import get_postgres_db

load_dotenv(dotenv_path="app/.env")

INTERACTION_COLLECTION = os.getenv('INTERACTION_COLLECTION')
mongo_db.set_collection(INTERACTION_COLLECTION)
collection = mongo_db.get_collection()

router = APIRouter()


@router.post('/interactions/{lead_id}', response_model=AddUpdateInteraction)
async def add_interaction(lead_id: int, interaction: AddUpdateInteraction, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "admin"])):
    try:
        interaction = interaction.model_dump()
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
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
            interaction["order"] = []
            db_lead.status = "contacted"
            db.commit()
            db.refresh(db_lead)
        result = await collection.insert_one(interaction)
        return interaction
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occurred: {e}")


@router.get('/interactions/{lead_id}', response_model=List[Interaction])
async def get_interactions(lead_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "viewer", "admin"])):
    try:
        interactions = await collection.find({"lead_id": lead_id}).to_list(length=1000)
        return interactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@router.get('/interactions', response_model=List[InteractionResponse])
async def get_all_interactions(db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "viewer", "admin"])):
    try:
        interactions = await collection.find({}).to_list(length=1000)
        lead_ids = [interaction['lead_id'] for interaction in interactions]
        leads = db.query(LeadModel).filter(LeadModel.id.in_(lead_ids)).all()
        lead_dict = {lead.id: lead.name for lead in leads}
        result = []
        for interaction in interactions:
            datetime_object = interaction["interaction_date"]
            interaction["interaction_date"] = convert_to_date_and_time(datetime_object)
            interaction['id'] = str(interaction["_id"])
            interaction["lead_name"] = lead_dict.get(interaction["lead_id"], "Unknown")
            result.append(interaction)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@router.put('/interactions/{lead_id}/{interaction_id}', response_model=AddUpdateInteraction)
async def update_interaction(lead_id: str, interaction_id: str, interaction: AddUpdateInteraction, permissions: bool = has_permission(["sales", "admin"])):
    interaction = interaction.model_dump()
    try:
        result = await collection.update_one({"_id": ObjectId(interaction_id)}, {"$set": interaction})
        if result.modified_count == 1:
            updated_interaction = await collection.find_one({"_id": ObjectId(interaction_id)})
            return updated_interaction
        raise HTTPException(status_code=404, detail="Interaction not found") 
    except Exception as e:   
        raise HTTPException(status_code=400, detail=f"An error occurred: {e}")
    

@router.delete('/interactions/{interaction_id}', response_model=dict)
async def delete_interaction(interaction_id: str, permissions: bool = has_permission(["admin"])):
    try:
        result = await collection.delete_one({"_id": ObjectId(interaction_id)})    
        if result.deleted_count == 1:
            return {"status": "success", "message": "Interaction deleted"}
        raise HTTPException(status_code=404, detail="Interaction not found")
    except Exception as e:  
        raise HTTPException(status_code=400, detail=f"An error occurred: {e}")