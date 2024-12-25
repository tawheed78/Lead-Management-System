from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import LeadModel, PointOfContactModel
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.schemas import POC
from ..utils.utils import has_permission

router = APIRouter()

@router.post('/{lead_id}/poc', response_model=POC)
async def add_poc(lead_id: int, poc: POC, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'admin'])):
    try:
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
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.get('/poc/all', response_model=List[POC])
async def get_all_pocs(db: Session = Depends(get_postgres_db)):
    try:
        return db.query(PointOfContactModel).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.get('/{lead_id}/pocs', response_model=List[POC])
async def get_pocs(lead_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales"])):
    try:
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return db.query(PointOfContactModel).filter(PointOfContactModel.lead_id == lead_id).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.put('/{lead_id}/poc/{poc_id}', response_model=POC)
async def update_poc(lead_id: int, poc_id: int, poc: POC, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin"])):
    try:
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        db_poc = db.query(PointOfContactModel).filter(PointOfContactModel.id == poc_id).first()
        if not db_poc:
            raise HTTPException(status_code=404, detail="Point of contact not found")
        db_poc.name = poc.name
        db_poc.role = poc.role
        db_poc.email = poc.email
        db_poc.phone_number = poc.phone_number
        db.commit()
        db.refresh(db_poc)
        return db_poc
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.delete('/{lead_id}/poc/{poc_id}')
async def delete_poc(lead_id: int, poc_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin"])):
    try:
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        db_poc = db.query(PointOfContactModel).filter(PointOfContactModel.id == poc_id).first()
        if not db_poc:
            raise HTTPException(status_code=404, detail="Point of contact not found")
        db.delete(db_poc)
        db.commit()
        return {"message": "Point of contact deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")