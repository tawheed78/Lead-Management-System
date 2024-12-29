from datetime import datetime, timedelta
from typing import List
from sqlalchemy import DateTime, cast
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session, joinedload
import pytz # type: ignore
from ..utils.utils import convert_to_ist, has_permission
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import LeadModel, CallModel, PointOfContactModel
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.schemas import CallCreate, CallUpdate, CallTodayResponse

router = APIRouter()

@router.post('/lead/{lead_id}/call', response_model=CallCreate)
async def add_call(
    lead_id: int,
    call: CallCreate,
    db: Session = Depends(get_postgres_db),
    permissions: bool = has_permission(["sales", "admin"])
):
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db_poc = db.query(PointOfContactModel).filter(PointOfContactModel.id == call.poc_id, PointOfContactModel.lead_id == lead_id).first()
    if not db_poc:
        raise HTTPException(status_code=404, detail="Point of Contact not found for this lead")
    
    lead_timezone = db_lead.timezone
    # Handle time localization and conversion
    call_datetime = f'{call.next_call_date} {call.next_call_time}'
    if lead_timezone != "Asia/Kolkata":
        call_datetime = convert_to_ist(call_datetime, lead_timezone)
        # Check if time is in the past, adjust if necessary
        if call_datetime < datetime.now():
            call_datetime += timedelta(days=1)
    call_datetime = datetime.strptime(call_datetime, '%Y-%m-%d %H:%M:%S')
    next_call_date = call_datetime.date()
    next_call_time = call_datetime.time()

    db_call = CallModel(
        poc_id=call.poc_id,
        frequency=call.frequency,
        last_call_date=None,
        next_call_date=next_call_date,
        next_call_time = next_call_time,
        lead_id=lead_id,
    )
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    return db_call


@router.put('/lead/{lead_id}/call/{call_id}/frequency')
async def update_call_frequency(lead_id: int, call_id: int, call: CallUpdate, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "admin"])):
    db_call = db.query(CallModel).filter(CallModel.id == call_id, CallModel.lead_id == lead_id).first()
    if not db_call:
        raise HTTPException(status_code=404, detail="Call not found")
    db_call.frequency = call.frequency
    db_call.next_call_date = datetime.now().date() + timedelta(days=call.frequency)
    db.commit()
    db.refresh(db_call)
    return db_call


@router.put('/lead/{lead_id}/call/{call_id}/log', response_model=CallCreate)
async def update_call_log(lead_id:int, call_id:int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", "admin"])):
    db_call = db.query(CallModel).filter(CallModel.id == call_id, CallModel.lead_id == lead_id).first()
    if not db_call:
        raise HTTPException(status_code=404, detail="Call not found")
    db_call.last_call_date = datetime.now()
    db_call.next_call_date = datetime.now().date() + timedelta(days=db_call.frequency)

    db.commit()
    db.refresh(db_call)
    return db_call


@router.get('/calls', response_model=List[CallTodayResponse])
async def calls(db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'viewer', 'admin'])):
    # today = datetime.now()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    calls = (
        db.query(CallModel)
        .options(joinedload(CallModel.lead), joinedload(CallModel.poc))
        .filter(cast(CallModel.next_call_date, DateTime) >= today)
        .all()
    )
    result = []
    for call in calls:
        result.append(CallTodayResponse(
            id = call.id,
            lead_id=call.lead_id,
            poc_id=call.poc_id,
            lead_name=call.lead.name,
            poc_name=call.poc.name,
            frequency=call.frequency,
            poc_contact=call.poc.phone_number,
            next_call_date= call.next_call_date,
            next_call_time= call.next_call_time
        ))
    
    return result


@router.get('/calls/today', response_model=List[CallTodayResponse])
async def calls_today(db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'viewer', 'admin'])):
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    calls = (
        db.query(CallModel)
        .options(joinedload(CallModel.lead), joinedload(CallModel.poc))
        .filter(
            cast(CallModel.next_call_date, DateTime) >= today_start,
            cast(CallModel.next_call_date, DateTime) < today_end
        )
        .all()
    )
    result = []
    for call in calls:
        result.append(CallTodayResponse(
            id = call.id,
            lead_id=call.lead_id,
            poc_id=call.poc_id,
            lead_name=call.lead.name,
            poc_name=call.poc.name,
            frequency=call.frequency,
            poc_contact=call.poc.phone_number,
            next_call_date= call.next_call_date,
            next_call_time= call.next_call_time
        ))
    return result


@router.delete('/lead/{lead_id}/call/{call_id}')
async def delete_call(call_id: int, db: Session = Depends(get_postgres_db), permissions: bool = has_permission(["sales", 'viewer', 'admin'])):
    try:
        db_call = db.query(CallModel).filter(CallModel.id == call_id).first()
        if not db_call:
            raise HTTPException(status_code=404, detail="Call not found")
        db.delete(db_call)
        db.commit()
        db.refresh
        return {"message": "Lead deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")