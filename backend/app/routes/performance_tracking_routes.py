from typing import List
from fastapi import APIRouter,Depends
from ..utils.utils import has_permission
from ..models.mongo_models import Performance
from ..configs.database.postgres_db import get_postgres_db
from sqlalchemy.orm import Session
from ..services.performance_service import get_performance_data
from ..services.performance_service_pipeline import well_performing_pipeline, under_performing_pipeline, total_data_pipeline

router = APIRouter()

@router.get('/well-performing', response_model=List[Performance])
async def well_performance(permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    return await get_performance_data(well_performing_pipeline, db, limit=5)

@router.get('/', response_model=List[dict])
async def performance(permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    return await get_performance_data(total_data_pipeline, db, limit=100)

@router.get('/under-performing', response_model=List[Performance])
async def under_performance(permissions: bool = has_permission(["sales", "viewer", "admin"]), db: Session = Depends(get_postgres_db)):
    return await get_performance_data(under_performing_pipeline, db, limit=5)
