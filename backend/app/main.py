from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from .configs.database.postgres_db import Base, engine, create_database_if_not_exists
from .routes.leads_routes import router as lead_router

app = FastAPI()



# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["localhost"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )

app.include_router(lead_router, prefix="/api/lead", tags=["Lead Operations"])


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