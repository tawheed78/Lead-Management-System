from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session, joinedload

from ..models.postgres_models import LeadModel, PointOfContactModel, CallModel
from ..configs.database.postgres_db import get_postgres_db
from ..schemas.schemas import Lead, LeadList, POC, CallCreate, CallUpdateFrequency, CallToday



router = APIRouter()

@router.post('/', response_model=Lead)
async def lead(lead: Lead, db: Session = Depends(get_postgres_db)):
    existing_lead = db.query(LeadModel).filter(LeadModel.name == lead.name).first()
    if existing_lead:
        raise HTTPException(status_code=400, detail="Lead with this name already exists")
    db_lead = LeadModel(name=lead.name, status=lead.status)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.get('/', response_model=List[LeadList])
async def leads(db: Session = Depends(get_postgres_db)):
    return db.query(LeadModel).all()

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

# @router.post('/{lead_id}/call', response_model=CallCreate)
# async def add_call(lead_id: int, call: CallCreate, db: Session = Depends(get_postgres_db)):
#     db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
#     if not db_lead:
#         raise HTTPException(status_code=404, detail="Lead not found")
#     next_call_date = datetime.now().date() + timedelta(days=call.frequency)
#     db_call = CallModel(frequency=call.frequency, last_call_date=None, next_call_date=next_call_date, lead_id=lead_id)
#     db.add(db_call)
#     db.commit()
#     db.refresh(db_call)
#     return db_call

# @router.put('/{lead_id}/call/{call_id}', response_model=CallCreate)
# async def update_call_frequency(lead_id: int, call_id: int, call: CallUpdateFrequency, db: Session = Depends(get_postgres_db)):
#     db_call = db.query(CallModel).filter(CallModel.id == call_id, CallModel.lead_id == lead_id).first()
#     if not db_call:
#         raise HTTPException(status_code=404, detail="Call not found")
#     db_call.frequency = call.frequency
#     db_call.next_call_date = datetime.now().date() + timedelta(days=call.frequency)
#     db.commit()
#     db.refresh(db_call)
#     return db_call


# @router.put('/{lead_id}/call/{call_id}/log', response_model=CallCreate)
# async def update_call_log(lead_id:int, call_id:int, db: Session = Depends(get_postgres_db)):
#     db_call = db.query(CallModel).filter(CallModel.id == call_id, CallModel.lead_id == lead_id).first()
#     if not db_call:
#         raise HTTPException(status_code=404, detail="Call not found")
#     db_call.last_call_date = datetime.now()
#     db_call.next_call_date = datetime.now().date() + timedelta(days=db_call.frequency)
#     db.commit()
#     db.refresh(db_call)
#     return db_call


# @router.get('/calls/today', response_model=List[CallToday])
# async def calls_today(db: Session = Depends(get_postgres_db)):
#     today = datetime.now().date()
#     calls = db.query(CallModel).options(joinedload(CallModel.lead)).filter(CallModel.next_call_date == today).all()
    
#     result = []
#     for call in calls:
#         result.append(CallToday(
#             lead_id=call.lead_id,
#             frequency=call.frequency,
#             lead_name=call.lead.name
#         ))
    
#     return result