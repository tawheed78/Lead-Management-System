"""This module defines the routes for performance tracking."""

import json
import redis.asyncio as aioredis # type: ignore
from typing import List
from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from ..utils.utils import has_permission, json_serializer
from ..models.mongo_models import Performance
from ..configs.database.postgres_db import get_postgres_db
from ..configs.redis.redis import get_redis_client
from ..services.performance_service import get_performance_data
from ..services.performance_service_pipeline import (
    well_performing_pipeline,
    under_performing_pipeline,
    total_data_pipeline
)

router = APIRouter()

@router.get('/well-performing', response_model=List[Performance])
async def well_performance(
    permissions: bool = has_permission(["sales", "viewer", "admin"]),
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client)
    ):
    """Route to retrieve the top 5 well-performing sales leads"""
    cache_key = "well-performing"
    performance_data_cache = await redis.get(cache_key)
    if performance_data_cache:
        return json.loads(performance_data_cache)
    
    performance_data_db = await get_performance_data(well_performing_pipeline, db, limit=5)
    await redis.set(cache_key, json.dumps(performance_data_db, default=json_serializer))
    return performance_data_db

@router.get('/', response_model=List[dict])
async def performance(
    permissions: bool = has_permission(["sales", "viewer", "admin"]),
    db: Session = Depends(get_postgres_db)
    ):
    """Route to retrieve the performance data for all sales leads."""
    return await get_performance_data(total_data_pipeline, db, limit=100)

@router.get('/under-performing', response_model=List[Performance])
async def under_performance(
    permissions: bool = has_permission(["sales", "viewer", "admin"]),
    db: Session = Depends(get_postgres_db),
    redis: aioredis.Redis = Depends(get_redis_client),
    ):
    """Route to retrieve the top 5 under-performing sales leads."""
    cache_key = "under-performing"
    performance_data_cache = await redis.get(cache_key)
    if performance_data_cache:
        return json.loads(performance_data_cache)
    performance_data_db = await get_performance_data(under_performing_pipeline, db, limit=5)
    await redis.set(cache_key, json.dumps(performance_data_db, default=json_serializer))
    return performance_data_db