"Model Configuration Module for Postgres DB"

from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..configs.database.postgres_db import Base

class UserModel(Base):
    """
    UserModel represents a user in the system.
    Attributes:
        id (int): The primary key for the user.
        full_name (str): The full name of the user.
        username (str): The unique username of the user.
        email (str): The unique email address of the user.
        password (str): The password for the user.
        role (str): The role of the user, default is 'viewer'.
        created_at (datetime): The timestamp when the user was created.
    """

    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default='viewer')
    created_at = Column(DateTime, default=datetime.now())


class LeadModel(Base):
    """
    LeadModel represents a lead in the lead management system.
    Attributes:
        id (int): Primary key for the lead.
        name (str): Name of the lead.
        address (str): Address of the lead.
        zipcode (str): Zipcode of the lead.
        state (str): State of the lead.
        country (str): Country of the lead.
        area_of_interest (str): Area of interest of the lead.
        status (str): Status of the lead, default is 'new'.
        created_at (datetime): Timestamp when the lead was created.
        contacts (relationship): Relationship to PointOfContactModel.
        calls (relationship): Relationship to CallModel.
    """

    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    zipcode = Column(String, nullable=False)
    state = Column(String, nullable=False)
    country = Column(String, nullable=False)
    area_of_interest = Column(String, nullable=False)
    status = Column(String, default='new')
    created_at = Column(DateTime, default=datetime.now())

    contacts = relationship("PointOfContactModel", back_populates="lead")
    calls = relationship("CallModel", back_populates="lead")


class PointOfContactModel(Base):
    """
    Represents a point of contact for a lead.
    Attributes:
        id (int): Unique identifier for the point of contact.
        lead_id (int): Foreign key referencing the associated lead.
        name (str): Name of the contact.
        role (str): Role of the contact.
        email (str): Email address of the contact.
        phone_number (str): Phone number of the contact.
    Relationships:
        lead: The lead associated with this point of contact.
    """

    __tablename__ = "point_of_contacts"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    email = Column(String)
    phone_number = Column(String, nullable=False)

    lead = relationship("LeadModel", back_populates="contacts")


class CallModel(Base):
    """
    CallModel represents the tracking of calls related to leads in the Lead Management System.
    Attributes:
        id (int): Primary key for the call record.
        lead_id (int): Foreign key referencing the associated lead.
        frequency (int): The frequency of calls made to the lead.
        last_call_date (datetime): The date and time of the last call made to the lead.
        next_call_date (datetime): The date and time of the next scheduled call to the lead.
    Relationships:
        lead (LeadModel): The lead associated with this call record.
    """

    __tablename__ = "calls_tracking"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    frequency = Column(Integer)
    last_call_date = Column(DateTime, default=None, nullable=True)
    next_call_date = Column(DateTime, default=None, nullable=True)

    lead = relationship("LeadModel", back_populates="calls")
