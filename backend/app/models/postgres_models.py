from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..configs.database.postgres_db import Base

class LeadModel(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    status = Column(String, default='new')
    created_at = Column(DateTime, default=datetime.now())

    # Relationships
    contacts = relationship("PointOfContactModel", back_populates="lead")
    calls = relationship("CallModel", back_populates="lead")


class PointOfContactModel(Base):
    __tablename__ = "point_of_contacts"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    email = Column(String)
    phone_number = Column(String, nullable=False)

    # Relationships
    lead = relationship("LeadModel", back_populates="contacts")


class CallModel(Base):
    __tablename__ = "calls_tracking"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    frequency = Column(Integer)
    last_call_date = Column(DateTime, default=None, nullable=True)

    # Relationships
    lead = relationship("LeadModel", back_populates="calls")