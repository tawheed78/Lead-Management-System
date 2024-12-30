from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import LeadModel, PointOfContactModel
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.postgres_schemas import POC, POCList
from ..utils.utils import has_permission
from ..services.point_of_contact_service import add_poc_to_lead,get_all_pocs,get_pocs_by_lead_id,update_poc_by_lead_id,delete_poc_by_lead_id

router = APIRouter()

@router.post('/{lead_id}/poc', response_model=POC)
async def add_poc(lead_id: int, poc: POC, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'admin'])):
    return add_poc_to_lead(lead_id, poc, db)


@router.get('/poc/all', response_model=List[POC])
async def get_all_pocs(db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'admin'])):
    return get_all_pocs(db)


@router.get('/{lead_id}/pocs', response_model=List[POCList])
async def get_pocs(lead_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'admin'])):
    try:
        return get_pocs_by_lead_id(lead_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.put('/{lead_id}/poc/{poc_id}', response_model=POC)
async def update_poc(lead_id: int, poc_id: int, poc: POC, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin"])):
    try:
        return update_poc(lead_id, poc_id, poc, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.delete('/{lead_id}/poc/{poc_id}')
async def delete_poc(lead_id: int, poc_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["admin"])):
    try:
        return delete_poc_by_lead_id(lead_id, poc_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")