from __future__ import annotations

import random
import datetime as dt
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

# ── Market ────────────────────────────────────────────────────────────────────
market_router = APIRouter()

_MARKET: dict[str, dict] = {
    "hyderabad":  {"avg_price_per_sqft": 6800,  "listing_density": 72, "demand_index": 78, "circle_rate": 4500,  "yoy_change": 11.2, "trend": "bullish"},
    "bangalore":  {"avg_price_per_sqft": 8500,  "listing_density": 85, "demand_index": 88, "circle_rate": 6000,  "yoy_change": 14.5, "trend": "bullish"},
    "mumbai":     {"avg_price_per_sqft": 19500, "listing_density": 90, "demand_index": 82, "circle_rate": 15000, "yoy_change": 8.3,  "trend": "bullish"},
    "chennai":    {"avg_price_per_sqft": 6200,  "listing_density": 65, "demand_index": 70, "circle_rate": 4000,  "yoy_change": 7.1,  "trend": "neutral"},
    "pune":       {"avg_price_per_sqft": 7400,  "listing_density": 70, "demand_index": 74, "circle_rate": 5000,  "yoy_change": 9.8,  "trend": "bullish"},
    "delhi":      {"avg_price_per_sqft": 12500, "listing_density": 80, "demand_index": 76, "circle_rate": 9000,  "yoy_change": 6.2,  "trend": "neutral"},
}


@market_router.get("/market-trends")
async def market_trends(_=Depends(get_current_user)):
    return [{"city": c, **d} for c, d in _MARKET.items()]


@market_router.get("/market-trends/{city}")
async def city_trend(city: str, _=Depends(get_current_user)):
    data = _MARKET.get(city.lower(), {"avg_price_per_sqft": 5000, "listing_density": 60, "demand_index": 60, "circle_rate": 3000, "yoy_change": 5.0, "trend": "neutral"})
    return {"city": city, **data}


# ── Fraud ─────────────────────────────────────────────────────────────────────
fraud_router = APIRouter()


@fraud_router.get("/fraud-analysis/{vid}")
async def fraud_analysis(vid: str, _=Depends(get_current_user)):
    return {
        "valuation_id": vid,
        "fraud_score": round(random.uniform(0.04, 0.15), 3),
        "checks": [
            {"name": "Area vs Locality Norm",      "score": round(random.uniform(0.01, 0.12), 3), "status": "PASS"},
            {"name": "Price vs Circle Rate",        "score": round(random.uniform(0.02, 0.18), 3), "status": "PASS"},
            {"name": "Coordinate Validity",         "score": round(random.uniform(0.01, 0.05), 3), "status": "PASS"},
            {"name": "Type-Size Consistency",       "score": round(random.uniform(0.01, 0.10), 3), "status": "PASS"},
            {"name": "Rental Yield Sanity",         "score": round(random.uniform(0.01, 0.08), 3), "status": "PASS"},
            {"name": "Overvaluation Guard",         "score": round(random.uniform(0.02, 0.15), 3), "status": "PASS"},
        ],
        "verdict": "LOW_RISK",
    }


# ── Reports ───────────────────────────────────────────────────────────────────
reports_router = APIRouter()


@reports_router.post("/generate-report")
async def generate_report(valuation_id: str, _=Depends(get_current_user)):
    return {
        "report_id": f"QAI-{random.randint(10000, 99999)}",
        "valuation_id": valuation_id,
        "status": "generated",
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
    }


# ── Admin ─────────────────────────────────────────────────────────────────────
admin_router = APIRouter()


@admin_router.get("/stats")
async def stats(_=Depends(get_current_user)):
    return {
        "total_valuations": random.randint(1200, 2000),
        "valuations_today": random.randint(40, 120),
        "fraud_flags_today": random.randint(2, 12),
        "avg_confidence": round(random.uniform(0.68, 0.78), 2),
        "model_drift_score": round(random.uniform(0.02, 0.07), 3),
        "active_users": random.randint(25, 80),
        "api_calls_today": random.randint(400, 1200),
    }
