"""
QUANTARA AI — FastAPI Backend
Python 3.11+ | FastAPI 0.115.6
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import engine, Base

from app.api.routes.auth import router as auth_router
from app.api.routes.valuation import router as val_router
from app.api.routes.simulation import router as sim_router
from app.api.routes.misc import (
    market_router,
    fraud_router,
    reports_router,
    admin_router,
)

# -------------------------------------------------------------------
# Logging
# -------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

log = logging.getLogger("quantara")


# -------------------------------------------------------------------
# Lifespan
# -------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("🚀 Quantara AI starting...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    log.info("✅ Database tables ready")

    yield

    log.info("🛑 Quantara AI shutting down")


# -------------------------------------------------------------------
# App
# -------------------------------------------------------------------

app = FastAPI(
    title="Quantara AI",
    description="AI-Powered Collateral Valuation & Resale Liquidity Engine",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)


# -------------------------------------------------------------------
# CORS FIX
# -------------------------------------------------------------------

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # ADD YOUR VERCEL URL HERE
    "https://quantara-ai.vercel.app",

    # OPTIONAL: allow all vercel preview deployments
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Compression
# -------------------------------------------------------------------

app.add_middleware(
    GZipMiddleware,
    minimum_size=1000
)


# -------------------------------------------------------------------
# Routers
# -------------------------------------------------------------------

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Auth"]
)

app.include_router(
    val_router,
    prefix="/api",
    tags=["Valuation"]
)

app.include_router(
    sim_router,
    prefix="/api",
    tags=["Simulation"]
)

app.include_router(
    market_router,
    prefix="/api",
    tags=["Market"]
)

app.include_router(
    fraud_router,
    prefix="/api",
    tags=["Fraud"]
)

app.include_router(
    reports_router,
    prefix="/api",
    tags=["Reports"]
)

app.include_router(
    admin_router,
    prefix="/api/admin",
    tags=["Admin"]
)


# -------------------------------------------------------------------
# Root
# -------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def root():
    return {
        "product": "Quantara AI",
        "tagline": "Quantifying Value. Decoding Liquidity.",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/api/docs",
    }


# -------------------------------------------------------------------
# Health
# -------------------------------------------------------------------

@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy"
    }
