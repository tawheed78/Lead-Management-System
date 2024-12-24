from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session, joinedload

from ..models.mongo_models import Interaction
from ..configs.database.mongo_db import db_instance
from ..schemas.schemas import Lead, LeadList, POC, CallCreate, CallUpdateFrequency, CallToday

router = APIRouter()

db_instance.set_collection("interaction_tracking_collection")
collection = db_instance.get_collection()

@router.post('/interactions/{lead_id}', response_model=Interaction)
async def add_interaction(lead_id: int, interaction: Interaction):
    interaction = interaction.model_dump()
    interaction["lead_id"] = lead_id
    interaction["interaction_date"] = datetime.now()
    try:
        result = await collection.insert_one(interaction)
        return interaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occurred: {e}")