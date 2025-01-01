"""This module contains the routes for the point of contact endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.postgres_schemas import POC, POCList
from ..utils.utils import has_permission
from ..services.point_of_contact_service import (
    add_poc_to_lead,
    get_all_pocs,
    get_pocs_by_lead_id,
    delete_poc_by_lead_id
)

router = APIRouter()

@router.post('/{lead_id}/poc', response_model=POC)
async def add_poc(
    lead_id: int,
    poc: POC,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["sales", 'admin'])
    ):
    """ROute to add a point of contact to a lead."""
    return add_poc_to_lead(lead_id, poc, db)


@router.get('/poc/all', response_model=List[POC])
async def get_all(
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["sales", 'admin', 'viewer'])
    ):
    """Route to retrieve all points of contact."""
    return get_all_pocs(db)


@router.get('/{lead_id}/pocs', response_model=List[POCList])
async def get_pocs(
    lead_id: int,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["sales", 'admin', 'viewer'])
    ):
    """Route to retrieve all points of contact for a specific lead."""
    try:
        return get_pocs_by_lead_id(lead_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.put('/{lead_id}/poc/{poc_id}', response_model=POC)
async def update_poc(
    lead_id: int,
    poc_id: int,
    poc: POC,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["admin", "sales"])
    ):
    """Route to update a point of contact by ID."""
    try:
        return update_poc(lead_id, poc_id, poc, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.delete('/{lead_id}/poc/{poc_id}')
async def delete_poc(
    lead_id: int,
    poc_id: int,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["admin"])
    ):
    """Route to delete a point of contact by ID."""
    try:
        return delete_poc_by_lead_id(lead_id, poc_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
