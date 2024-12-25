from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from .configs.database.postgres_db import Base, engine, create_database_if_not_exists
from .routes.leads_routes import router as lead_router
from .routes.point_of_contact_routes import router as point_of_contact_router
from .routes.call_tracking_routes import router as call_tracking_router
from .routes.interaction_tracking_routes import router as interaction_tracking_router
from .routes.performance_tracking_routes import router as performance_tracking_router
from .routes.user_routes import router as user_router


app = FastAPI()



# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["localhost"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )

app.include_router(user_router, prefix="/api/user", tags=["User Operations"])
app.include_router(lead_router, prefix="/api/lead", tags=["Lead Operations"])
app.include_router(point_of_contact_router, prefix="/api/lead", tags=["Point of Contact Operations"])
app.include_router(call_tracking_router, prefix="/api", tags=["Call Tracking Operations"])
app.include_router(interaction_tracking_router, prefix="/api", tags=["Interaction Tracking Operations"])
app.include_router(performance_tracking_router, prefix="/api/performance", tags=["Performance Tracking Operations"])


@app.get("/")
async def root():
    return {"message": "Welcome to ..."}



# try:
#     create_database_if_not_exists()
#     print(f"Connecting to database")
#     Base.metadata.create_all(bind=engine)
#     print("Tables created successfully.")
# except Exception as e:
#     print(f"Error during setup: {e}")