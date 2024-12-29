from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import LeadModel
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.schemas import Lead, LeadList, LeadCreateUpdate
from ..utils.utils import has_permission

router = APIRouter()

@router.post('/', response_model=Lead)
async def create_lead(lead: LeadCreateUpdate, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin"])):
    try:
        existing_lead = db.query(LeadModel).filter(LeadModel.name == lead.name).first()
        if existing_lead:
            raise HTTPException(status_code=400, detail="Lead with this name already exists")
        db_lead = LeadModel(
            name=lead.name, 
            address=lead.address, 
            zipcode=lead.zipcode, 
            state=lead.state, 
            country=lead.country,
            timezone = lead.timezone, 
            area_of_interest=lead.area_of_interest, 
            status=lead.status
        )
        db.add(db_lead)
        db.commit()
        db.refresh(db_lead)
        return db_lead
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.get('/', response_model=List[LeadList])
async def get_leads(db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin", 'sales', 'viewer'])):
    try:
        return db.query(LeadModel).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.get('/{lead_id}', response_model=Lead)
async def get_lead(lead_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin", 'sales', 'viewer'])):
    try:
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return db_lead
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.put('/{lead_id}', response_model=Lead)
async def update_lead(lead_id: int, lead: LeadCreateUpdate, db: Session = Depends(get_postgres_db), permissions: bool = has_permission("admin")):
    try:
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        db_lead.name = lead.name
        db_lead.status = lead.status
        db_lead.address = lead.address
        db_lead.zipcode = lead.zipcode
        db_lead.state = lead.state
        db_lead.country = lead.country
        db_lead.area_of_interest = lead.area_of_interest
        db_lead.timezone = lead.timezone
        db.commit()
        db.refresh(db_lead)
        return db_lead
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.delete('/{lead_id}')
async def delete_lead(lead_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission("admin")):
    try:
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        db.delete(db_lead)
        db.commit()
        return {"message": "Lead deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")