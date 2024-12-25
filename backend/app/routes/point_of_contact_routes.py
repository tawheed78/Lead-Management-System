from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.postgres_models import LeadModel, PointOfContactModel
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.schemas import POC

router = APIRouter()

@router.post('/{lead_id}/poc', response_model=POC)
async def add_poc(lead_id: int, poc: POC, db: Session = Depends(get_postgres_db)):
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db_poc = PointOfContactModel(
        name=poc.name,
        role=poc.role,
        email=poc.email,
        phone_number=poc.phone_number,
        lead_id=lead_id
    )
    db.add(db_poc)
    db.commit()
    db.refresh(db_poc)
    return db_poc

@router.get('/{lead_id}/poc', response_model=List[POC])
async def get_pocs(lead_id: int, db:Session = Depends(get_postgres_db)):
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db.query(PointOfContactModel).filter(PointOfContactModel.lead_id == lead_id).all()