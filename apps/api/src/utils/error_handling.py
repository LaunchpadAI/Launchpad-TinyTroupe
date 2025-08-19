"""
Error handling utilities
"""

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class TinyTroupeAPIException(Exception):
    """Base exception for TinyTroupe API"""
    
    def __init__(self, message: str, status_code: int = 500, error_code: str = "INTERNAL_ERROR"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)

class AgentNotFoundException(TinyTroupeAPIException):
    """Exception raised when agent is not found"""
    
    def __init__(self, agent_id: str):
        super().__init__(
            message=f"Agent '{agent_id}' not found",
            status_code=404,
            error_code="AGENT_NOT_FOUND"
        )

class SimulationFailedException(TinyTroupeAPIException):
    """Exception raised when simulation fails"""
    
    def __init__(self, reason: str):
        super().__init__(
            message=f"Simulation failed: {reason}",
            status_code=400,
            error_code="SIMULATION_FAILED"
        )

class ValidationException(TinyTroupeAPIException):
    """Exception raised when validation fails"""
    
    def __init__(self, message: str):
        super().__init__(
            message=f"Validation error: {message}",
            status_code=422,
            error_code="VALIDATION_ERROR"
        )

async def tinytroupe_exception_handler(request: Request, exc: TinyTroupeAPIException):
    """Global exception handler for TinyTroupe API exceptions"""
    logger.error(f"TinyTroupe API Error: {exc.error_code} - {exc.message}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "status_code": exc.status_code
            }
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Global exception handler for general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal server error occurred",
                "status_code": 500
            }
        }
    )