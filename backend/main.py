"""CodePulse — AI Developer Intelligence Platform Backend."""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from models.db import init_db
from routers import github, analysis, dashboard

load_dotenv()

app = FastAPI(
    title="CodePulse API",
    description="AI Developer Intelligence Platform — Analyze developer impact, trace requirements, and detect knowledge risks.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
origins = [o.strip() for o in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(github.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup."""
    init_db()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global error handler returning consistent JSON error responses."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
        },
    )


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": "CodePulse API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    """API health check."""
    return {"status": "healthy", "service": "codepulse-api"}
