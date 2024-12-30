from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.status import HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR

def error_response(message: str, status_code: int):
    return JSONResponse(
        status_code=status_code,
        content={"detail": message}
    )

# 404 Not Found
async def not_found_error_handler(request: Request, exc: HTTPException):
    return error_response(message="Resource not found", status_code=HTTP_404_NOT_FOUND)

# 400 Bad Request
async def bad_request_error_handler(request: Request, exc: HTTPException):
    return error_response(message="Bad Request - Invalid data provided", status_code=HTTP_400_BAD_REQUEST)

# 500 Internal Server Error
async def internal_server_error_handler(request: Request, exc: HTTPException):
    return error_response(message="An unexpected error occurred", status_code=HTTP_500_INTERNAL_SERVER_ERROR)

# General Exception Handler (for any other unhandled exceptions)
async def general_exception_handler(request: Request, exc: Exception):
    return error_response(message=f"An unexpected error occurred: {str(exc)}", status_code=500)
