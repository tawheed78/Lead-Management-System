from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from ..models.postgres_models import LeadModel, PointOfContactModel
from ..schemas.postgres_schemas import POC, POCList


def add_poc_to_lead(lead_id: int, poc: POC, db: Session):
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
    try:
        db.add(db_poc)
        db.commit()
        db.refresh(db_poc)
        return db_poc
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


def get_all_pocs(db: Session):
    try:
        return db.query(PointOfContactModel).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


def get_pocs_by_lead_id(lead_id: int, db: Session):
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    try:
        return db.query(PointOfContactModel).filter(PointOfContactModel.lead_id == lead_id).all()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


def update_poc_by_lead_id(lead_id: int, poc_id: int, poc: POC, db: Session):
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db_poc = db.query(PointOfContactModel).filter(PointOfContactModel.id == poc_id).first()
    if not db_poc:
        raise HTTPException(status_code=404, detail="Point of contact not found")

    db_poc.name = poc.name
    db_poc.role = poc.role
    db_poc.email = poc.email
    db_poc.phone_number = poc.phone_number

    try:
        db.commit()
        db.refresh(db_poc)
        return db_poc
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


def delete_poc_by_lead_id(lead_id: int, poc_id: int, db: Session):
    db_lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db_poc = db.query(PointOfContactModel).filter(PointOfContactModel.id == poc_id).first()
    if not db_poc:
        raise HTTPException(status_code=404, detail="Point of contact not found")

    try:
        db.delete(db_poc)
        db.commit()
        return {"message": "Point of contact deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
