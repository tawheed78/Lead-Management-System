"""This module contains routes for call tracking."""
import json
import redis.asyncio as aioredis # type: ignore
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.utils import has_permission, json_serializer
from ..configs.database.postgres_db import get_postgres_db
from ..configs.redis.redis import get_redis_client
from ..schemas.postgres_schemas import CallCreate, CallUpdate, CallTodayResponse, CallResponse
from ..services.call_tracking_service import (
    add_call_to_lead,
    update_frequency,
    update_log,
    get_calls_today,
    get_all_calls,
    delete_call_with_id
)

router = APIRouter()

@router.post('/lead/{lead_id}/call', response_model=CallResponse)
async def add_call(
    lead_id: int,
    call: CallCreate,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["sales", "admin"])
    ):
    """Route to add a call to a lead."""
    try:
        return add_call_to_lead(lead_id, call, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.put('/lead/{lead_id}/call/{call_id}/frequency', response_model=CallCreate)
async def update_call_frequency(
    lead_id: int,
    call_id: int,
    call: CallUpdate,
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission(["sales", "admin"])
    ):
    """Route to update the frequency of a call."""
    try:
        cached_keys = ["calls-all", "calls-today"]
        (await redis.delete(key) for key in cached_keys)
        return update_frequency(call_id, lead_id, call, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.put('/lead/{lead_id}/call/{call_id}/log', response_model=CallCreate)
async def update_call_log(
    lead_id:int,
    call_id:int,
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission(["sales", "admin"])
    ):
    """Route to update the call log."""
    try:
        cached_keys = ["calls-all", "calls-today"]
        (await redis.delete(key) for key in cached_keys)
        return update_log(call_id, lead_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.get('/calls', response_model=List[CallTodayResponse])
async def calls(
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission(["sales", 'viewer', 'admin'])
    ):
    """Route to retrieve all calls."""
    try:
        cached_key = "calls-all"
        calls_data_redis = await redis.get(cached_key)
        if calls_data_redis:
            return json.loads(calls_data_redis)
        calls = get_all_calls(db)
        calls_data_db = [
            CallTodayResponse(
                id=call.id,
                lead_id=call.lead_id,
                poc_id=call.poc_id,
                lead_name=call.lead.name,
                poc_name=call.poc.name,
                frequency=call.frequency,
                poc_contact=call.poc.phone_number,
                next_call_date=call.next_call_date,
                next_call_time=call.next_call_time
            ).model_dump()
            for call in calls
        ]
        await redis.set(cached_key, json.dumps(calls_data_db, default=json_serializer), ex=3600)
        return calls_data_db
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.get('/calls/today', response_model=List[CallTodayResponse])
async def calls_today(
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission(["sales", 'viewer', 'admin'])
    ):
    """Route to retrieve all calls scheduled for today."""
    try:
        cached_key = "calls-today"
        calls_data_redis_today = await redis.get(cached_key)
        if calls_data_redis_today:
            return json.loads(calls_data_redis_today)
        calls = get_calls_today(db)
        calls_data_db_today = [
            CallTodayResponse(
                id=call.id,
                lead_id=call.lead_id,
                poc_id=call.poc_id,
                lead_name=call.lead.name,
                poc_name=call.poc.name,
                frequency=call.frequency,
                poc_contact=call.poc.phone_number,
                next_call_date=call.next_call_date,
                next_call_time=call.next_call_time
            ).model_dump()
            for call in calls
        ]
        await redis.set(cached_key, json.dumps(calls_data_db_today, default=json_serializer), ex=3600)
        return calls_data_db_today
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.delete('/lead/{lead_id}/call/{call_id}')
async def delete_call(
    call_id: int,
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    permissions: bool = has_permission(['admin'])
    ):
    """Route to delete a call by ID."""
    try:
        cached_key = "calls-all"
        await redis.delete(cached_key)
        return delete_call_with_id(call_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e
