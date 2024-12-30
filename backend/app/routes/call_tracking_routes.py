from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.utils import has_permission
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.postgres_schemas import CallCreate, CallUpdate, CallTodayResponse
from ..services.call_tracking_service import add_call_to_lead,update_frequency,update_log,get_calls_today,get_all_calls,delete_call_with_id

router = APIRouter()

@router.post('/lead/{lead_id}/call', response_model=CallCreate)
async def add_call(
    lead_id: int, call: CallCreate, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "admin"])):
    try:
        return add_call_to_lead(lead_id, call, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.put('/lead/{lead_id}/call/{call_id}/frequency')
async def update_call_frequency(lead_id: int, call_id: int, call: CallUpdate, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "admin"])):
    try:
        return update_frequency(call_id, lead_id, call, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.put('/lead/{lead_id}/call/{call_id}/log', response_model=CallCreate)
async def update_call_log(lead_id:int, call_id:int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "admin"])):
    try:
        return update_log(call_id, lead_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.get('/calls', response_model=List[CallTodayResponse])
async def calls(db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'viewer', 'admin'])):
    try:
        calls = get_all_calls(db)
        return [
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
            )
            for call in calls
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.get('/calls/today', response_model=List[CallTodayResponse])
async def calls_today(db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'viewer', 'admin'])):
    try:
        calls = get_calls_today(db)
        return [
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
            )
            for call in calls
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.delete('/lead/{lead_id}/call/{call_id}')
async def delete_call(call_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'viewer', 'admin'])):
    try:
        return delete_call_with_id(call_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")