from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..services.lead_service import create_new_lead, get_lead_by_id, update_lead_by_id, delete_lead_by_id
from ..models.postgres_models import LeadModel
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.schemas import Lead, LeadList, LeadCreateUpdate
from ..utils.utils import has_permission

router = APIRouter()


@router.post('/', response_model=Lead)
async def create_lead(lead: LeadCreateUpdate, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin"])):
    try:
        return create_new_lead(lead, db)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.get('/', response_model=List[LeadList])
async def get_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin", 'sales', 'viewer'])):
    try:
        return db.query(LeadModel).offset(skip).limit(limit).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.get('/{lead_id}', response_model=Lead)
async def get_lead(lead_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin", 'sales', 'viewer'])):
    try:
        return get_lead_by_id(lead_id, db)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.put('/{lead_id}', response_model=Lead)
async def update_lead(lead_id: int, lead: LeadCreateUpdate, db: Session = Depends(get_postgres_db), permissions: bool = has_permission("admin")):
    try:
        return update_lead_by_id(lead_id, lead, db)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.delete('/{lead_id}')
async def delete_lead(lead_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission("admin")):
    try:
        return delete_lead(lead_id, db)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")