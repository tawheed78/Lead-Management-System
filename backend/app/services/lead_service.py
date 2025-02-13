"""This module contains the service functions for the Lead model."""

from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from ..models.postgres_models import LeadModel

def get_lead_by_id(lead_id: int, db: Session):
    """Retrieve a lead by its ID."""
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead

def create_new_lead(lead, db:Session):
    """Create a new Lead"""
    existing_lead = db.query(LeadModel).filter(LeadModel.name == lead.name).first()
    if existing_lead:
        raise HTTPException(status_code=400, detail="Lead with this name already exists")
    try:
        db_lead = LeadModel(
            name=lead.name,
            address=lead.address,
            zipcode=lead.zipcode,
            state=lead.state,
            country=lead.country,
            timezone=lead.timezone,
            area_of_interest=lead.area_of_interest,
            status=lead.status
        )
        db.add(db_lead)
        db.commit()
        db.refresh(db_lead)
        return db_lead
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def update_lead_by_id(lead_id: int, lead, db: Session):
    """Update a lead by its ID."""
    try:
        db_lead = get_lead_by_id(lead_id, db)
        db_lead.name = lead.name
        db_lead.status = lead.status
        db_lead.address = lead.address
        db_lead.zipcode = lead.zipcode
        db_lead.state = lead.state
        db_lead.country = lead.country
        db_lead.area_of_interest = lead.area_of_interest
        db_lead.timezone = lead.timezone
        db.commit()
        db.refresh(db_lead)
        return db_lead
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def delete_lead_by_id(lead_id: int, db: Session):
    """Delete a Lead by its ID"""
    try:
        db_lead = get_lead_by_id(lead_id, db)
        print(db_lead)
        db.delete(db_lead)
        db.commit()
        return {"message": "Lead deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}") from e
