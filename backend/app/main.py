import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from prometheus_fastapi_instrumentator import Instrumentator # type: ignore
from multiprocessing import Queue
from .routes.leads_routes import router as lead_router
from .routes.point_of_contact_routes import router as point_of_contact_router
from .routes.call_tracking_routes import router as call_tracking_router
from .routes.interaction_tracking_routes import router as interaction_tracking_router
from .routes.performance_tracking_routes import router as performance_tracking_router
from .routes.user_routes import router as user_router

from app.exceptions.exception_handler import (
    not_found_error_handler,
    bad_request_error_handler,
    internal_server_error_handler,
    general_exception_handler,
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://lead-management-system-mu.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Registering custom exception handlers
app.add_exception_handler(HTTP_404_NOT_FOUND, not_found_error_handler)
app.add_exception_handler(HTTP_400_BAD_REQUEST, bad_request_error_handler)
app.add_exception_handler(HTTP_500_INTERNAL_SERVER_ERROR, internal_server_error_handler)
app.add_exception_handler(Exception, general_exception_handler)

#Registering Routers
app.include_router(user_router, prefix="/api/user", tags=["User Operations"])
app.include_router(lead_router, prefix="/api/lead", tags=["Lead Operations"])
app.include_router(point_of_contact_router, prefix="/api/lead", tags=["Point of Contact Operations"])
app.include_router(call_tracking_router, prefix="/api", tags=["Call Tracking Operations"])
app.include_router(interaction_tracking_router, prefix="/api", tags=["Interaction Tracking Operations"])
app.include_router(performance_tracking_router, prefix="/api/performance", tags=["Performance Tracking Operations"])

# Initialize Prometheus monitoring
instrumentator = Instrumentator().instrument(app)
instrumentator.expose(app, endpoint="https://lead-management-prometheus-service.onrender.com/metrics")

@app.get("/")
async def root():
    return {"message": "Welcome to ..."}
