"""
TinyTroupe API - Modular Production Architecture
A FastAPI service that exposes full TinyTroupe functionality through production-ready APIs
Refactored for DRY/SRP compliance with modular architecture
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from src.core.config import settings
from src.routers import create_api_router
from src.utils import (
    setup_logging,
    TinyTroupeAPIException,
    tinytroupe_exception_handler,
    general_exception_handler
)

# Initialize logging
logger = setup_logging(settings.LOG_LEVEL)

# Initialize TinyTroupe path
settings.setup_tinytroupe_path()

# Import TinyTroupe after path setup
import tinytroupe
import tinytroupe.control as control

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add exception handlers
app.add_exception_handler(TinyTroupeAPIException, tinytroupe_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
api_router = create_api_router()
app.include_router(api_router)

# Initialize TinyTroupe control system
@app.on_event("startup")
async def startup_event():
    """Initialize TinyTroupe control system on startup"""
    control.begin()

@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup TinyTroupe control system on shutdown"""
    control.end()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)