"""This module contains routes for leads."""

import json
import redis.asyncio as aioredis # type: ignore
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import LeadModel
from ..configs.redis.redis import get_redis_client
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.postgres_schemas import Lead, LeadResponse, LeadCreateUpdate
from ..utils.utils import has_permission, json_serializer
from ..services.lead_service import (
    create_new_lead, 
    get_lead_by_id, 
    update_lead_by_id, 
    delete_lead_by_id
)

router = APIRouter()

@router.post('/', response_model=LeadResponse)
async def create_lead(
    lead: LeadCreateUpdate,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["sales","admin"])
    ):
    """Route to create a new lead."""
    try:
        return create_new_lead(lead, db)
        
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e


@router.get('/', response_model=List[LeadResponse])
async def get_all_leads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission(["admin", 'sales', 'viewer'])
    ):
    """Route to retrieve all leads."""
    try:
        cache_key = "leads-all"
        leads_data = await redis.get(cache_key)
        if leads_data:
            print('hi')
            return json.loads(leads_data)
        leads =  db.query(LeadModel).offset(skip).limit(limit).all()
        leads_data = [LeadResponse.model_validate(lead).model_dump() for lead in leads]
        await redis.set(cache_key, json.dumps(leads_data, default=json_serializer), ex=300)
        return leads_data

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e


@router.get('/{lead_id}', response_model=Lead)
async def get_lead(
    lead_id: int,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["admin", 'sales', 'viewer'])
    ):
    """Route to retrieve a lead by its ID."""
    try:
        return get_lead_by_id(lead_id, db)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e


@router.put('/{lead_id}', response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    lead: LeadCreateUpdate,
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission("admin")
    ):
    """Route to update a lead by its ID."""
    try:
        cached_key = "leads-all"
        await redis.delete(cached_key)
        return update_lead_by_id(lead_id, lead, db)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e


@router.delete('/{lead_id}')
async def delete_lead(
    lead_id: int,
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission("admin")
    ):
    """Route to delete a lead by its ID."""
    try:
        cached_key = "leads-all"
        await redis.delete(cached_key)
        return delete_lead_by_id(lead_id, db)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
