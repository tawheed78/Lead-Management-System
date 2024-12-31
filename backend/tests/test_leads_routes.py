import unittest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.postgres_models import LeadModel
from app.routes import leads_routes
from app.services import lead_service

class TestLeadRoutes(unittest.TestCase):
    def setUp(self):
        self.db = Mock(spec=Session)
        self.lead_model = Mock(spec=LeadModel)

    def test_get_lead_by_id_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        result = leads_routes.get_lead_by_id(1, self.db)
        self.assertEqual(result, self.lead_model)

    def test_get_lead_by_id_not_found(self):
        self.db.query.return_value.filter.return_value.first.return_value = None
        with self.assertRaises(HTTPException) as context:
            leads_routes.get_lead_by_id(1, self.db)
        self.assertEqual(context.exception.status_code, 404)

    def test_create_new_lead_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = None
        lead_data = Mock(name="Test Lead", address="Test Address", zipcode="12345", 
                         state="Test State", country="Test Country", timezone="UTC",
                         area_of_interest="Test Area", status="Active")
        result = leads_routes.create_new_lead(lead_data, self.db)
        self.assertTrue(self.db.add.called)
        self.assertTrue(self.db.commit.called)
        self.assertTrue(self.db.refresh.called)

    def test_create_new_lead_already_exists(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        lead_data = Mock(name="Existing Lead")
        with self.assertRaises(HTTPException) as context:
            leads_routes.create_new_lead(lead_data, self.db)
        self.assertEqual(context.exception.status_code, 400)

    def test_update_lead_by_id_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        lead_data = Mock(name="Updated Lead", status="Inactive", address="New Address", 
                         zipcode="54321", state="New State", country="New Country",
                         area_of_interest="New Area", timezone="GMT")
        result = leads_routes.update_lead_by_id(1, lead_data, self.db)
        self.assertEqual(result, self.lead_model)
        self.assertTrue(self.db.commit.called)
        self.assertTrue(self.db.refresh.called)

    def test_delete_lead_by_id_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        result = leads_routes.delete_lead_by_id(1, self.db)
        self.assertEqual(result, {"message": "Lead deleted successfully"})
        self.assertTrue(self.db.delete.called)
        self.assertTrue(self.db.commit.called)

class TestLeadService(unittest.TestCase):
    def setUp(self):
        self.db = Mock(spec=Session)
        self.lead_model = Mock(spec=LeadModel)

    def test_get_lead_by_id_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        result = lead_service.get_lead_by_id(1, self.db)
        self.assertEqual(result, self.lead_model)

    def test_get_lead_by_id_not_found(self):
        self.db.query.return_value.filter.return_value.first.return_value = None
        with self.assertRaises(HTTPException) as context:
            lead_service.get_lead_by_id(1, self.db)
        self.assertEqual(context.exception.status_code, 404)

    def test_create_new_lead_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = None
        lead_data = Mock(name="Test Lead", address="Test Address", zipcode="12345", 
                         state="Test State", country="Test Country", timezone="UTC",
                         area_of_interest="Test Area", status="Active")
        result = lead_service.create_new_lead(lead_data, self.db)
        self.assertTrue(self.db.add.called)
        self.assertTrue(self.db.commit.called)
        self.assertTrue(self.db.refresh.called)

    def test_create_new_lead_already_exists(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        lead_data = Mock(name="Existing Lead")
        with self.assertRaises(HTTPException) as context:
            lead_service.create_new_lead(lead_data, self.db)
        self.assertEqual(context.exception.status_code, 400)

    def test_update_lead_by_id_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        lead_data = Mock(name="Updated Lead", status="Inactive", address="New Address", 
                         zipcode="54321", state="New State", country="New Country",
                         area_of_interest="New Area", timezone="GMT")
        result = lead_service.update_lead_by_id(1, lead_data, self.db)
        self.assertEqual(result, self.lead_model)
        self.assertTrue(self.db.commit.called)
        self.assertTrue(self.db.refresh.called)

    def test_delete_lead_by_id_success(self):
        self.db.query.return_value.filter.return_value.first.return_value = self.lead_model
        result = lead_service.delete_lead_by_id(1, self.db)
        self.assertEqual(result, {"message": "Lead deleted successfully"})
        self.assertTrue(self.db.delete.called)
        self.assertTrue(self.db.commit.called)