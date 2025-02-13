"""This module contains the service functions for the call tracking feature."""

from datetime import datetime, timedelta
import pytz # type: ignore
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import cast, DateTime
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import LeadModel, CallModel, PointOfContactModel
from ..schemas.postgres_schemas import CallCreate, CallUpdate
from ..utils.utils import convert_to_ist

def add_call_to_lead(lead_id: int, call: CallCreate, db: Session):
    """Plan a call with a specific lead."""
    try:
        db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
        if not db_lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        db_poc = db.query(PointOfContactModel).filter(PointOfContactModel.id == call.poc_id, PointOfContactModel.lead_id == lead_id).first()
        if not db_poc:
            raise HTTPException(status_code=404, detail="Point of Contact not found for this lead")
        lead_timezone = db_lead.timezone
        call_datetime = f'{call.next_call_date} {call.next_call_time}'
        if lead_timezone != "Asia/Kolkata":
            call_datetime = convert_to_ist(call_datetime, lead_timezone)
            if call_datetime < datetime.now():
                call_datetime += timedelta(days=1)
        call_datetime = datetime.strptime(str(call_datetime), '%Y-%m-%d %H:%M:%S')
        next_call_date = call_datetime.date()
        next_call_time = call_datetime.time()

        db_call = CallModel(
            poc_id=call.poc_id,
            frequency=call.frequency,
            last_call_date=None,
            next_call_date=next_call_date,
            next_call_time=next_call_time,
            lead_id=lead_id,
        )
        db.add(db_call)
        db.commit()
        db.refresh(db_call)
        response = {
            **{key: value for key, value in db_call.__dict__.items() if not key.startswith("_")},
            "lead_name": db_lead.name,  # Include lead_name
            "poc_name": db_poc.name,    # Include poc_name
            "poc_contact": db_poc.phone_number  # Include poc_contact
        }
        return response
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


def update_frequency(call_id: int, lead_id: int, call: CallUpdate, db: Session):
    """Update the frequency of a call."""
    try:
        db_call = db.query(CallModel).filter(CallModel.id == call_id, CallModel.lead_id == lead_id).first()
        if not db_call:
            raise HTTPException(status_code=404, detail="Call not found")
        db_call.frequency = call.frequency
        db_call.next_call_date = datetime.now().date() + timedelta(days=call.frequency)
        db.commit()
        db.refresh(db_call)
        return db_call
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


def update_log(call_id: int, lead_id: int, db: Session):
    """Update the last call date and the next call date of a call once the latest call is done."""
    try:
        db_call = db.query(CallModel).filter(CallModel.id == call_id, CallModel.lead_id == lead_id).first()
        if not db_call:
            raise HTTPException(status_code=404, detail="Call not found")
        db_call.last_call_date = datetime.now()
        db_call.next_call_date = datetime.now().date() + timedelta(days=db_call.frequency)

        db.commit()
        db.refresh(db_call)
        return db_call
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


def get_calls_today(db: Session):
    """Retrieve all calls scheduled for today."""
    try:
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
        return calls
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


def get_all_calls(db: Session):
    """Retrieve all calls."""
    try:
        calls = (
            db.query(CallModel)
            .options(joinedload(CallModel.lead), joinedload(CallModel.poc))
            .all()
        )
        return calls
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


def delete_call_with_id(call_id: int, db: Session):
    """Delete a call by its ID."""
    try:
        db_call = db.query(CallModel).filter(CallModel.id == call_id).first()
        if not db_call:
            raise HTTPException(status_code=404, detail="Call not found")
        db.delete(db_call)
        db.commit()
        return {"message": "Call deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e
