from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.ml.engine import compute_valuation
from app.ml.explainability import generate_explanation
from app.models.models import Property, Valuation
from app.schemas.schemas import (
    ValuationRequest, ValuationOut, RiskFlag, SHAPItem,
)

router = APIRouter()

_RISK_CATALOG: dict[str, RiskFlag] = {
    "mkt_comp": RiskFlag(code="mkt_comp", label="High Market Competition", severity="medium",
                         description="Elevated listing density may extend absorption period."),
    "age_risk":  RiskFlag(code="age_risk",  label="Building Age Risk",         severity="low",
                          description="Vintage increases maintenance liability; review structural report."),
    "legal":     RiskFlag(code="legal",     label="Legal Complexity",           severity="high",
                          description="Leasehold/disputed title — mandatory legal due diligence."),
    "yield_low": RiskFlag(code="yield_low", label="Low Rental Yield",           severity="medium",
                          description="Below-market rental yield suggests weaker investment profile."),
    "fraud":     RiskFlag(code="fraud",     label="Fraud Alert",                severity="high",
                          description="Anomaly detected — manual verification before disbursement."),
}


def _build_flags(prop: object, ml: dict) -> list[RiskFlag]:
    flags: list[RiskFlag] = []
    age = getattr(prop, "age_years", 0)
    legal = (getattr(prop, "legal_status", "") or "").lower()
    yield_ = getattr(prop, "rental_yield", None)

    if age > 20:
        flags.append(_RISK_CATALOG["age_risk"])
    if "leasehold" in legal or "disputed" in legal:
        flags.append(_RISK_CATALOG["legal"])
    if yield_ is not None and yield_ < 2.5:
        flags.append(_RISK_CATALOG["yield_low"])
    if ml["fraud_score"] > 0.30:
        flags.append(_RISK_CATALOG["fraud"])
    if ml["resale_potential_index"] < 50:
        flags.append(_RISK_CATALOG["mkt_comp"])
    return flags


@router.post("/analyze-property", response_model=ValuationOut, status_code=201)
async def analyze_property(
    req: ValuationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    p = req.property

    # Persist property
    prop = Property(
        address=p.address, city=p.city, state=p.state,
        latitude=p.latitude, longitude=p.longitude,
        property_type=p.property_type.value,
        sub_type=p.sub_type, area_sqft=p.area_sqft,
        age_years=p.age_years, floor_level=p.floor_level,
        legal_status=p.legal_status, occupancy=p.occupancy,
        rental_yield=p.rental_yield, rera_registered=p.rera_registered,
    )
    db.add(prop)
    await db.flush()
    await db.refresh(prop)

    ml = compute_valuation(p)
    explanation = await generate_explanation(ml, p) if req.include_explanation else None
    risk_flags = _build_flags(p, ml)

    val = Valuation(
        property_id=prop.id,
        user_id=current_user["id"],
        market_value_low=ml["market_value_low"],
        market_value_high=ml["market_value_high"],
        distress_value_low=ml["distress_value_low"],
        distress_value_high=ml["distress_value_high"],
        resale_potential_index=ml["resale_potential_index"],
        time_to_sell_min=ml["time_to_sell_min"],
        time_to_sell_max=ml["time_to_sell_max"],
        confidence_score=ml["confidence_score"],
        llm_explanation=explanation,
        risk_flags=json.dumps([f.model_dump() for f in risk_flags]),
        shap_values=json.dumps(ml["shap_values"]),
        feature_importance=json.dumps(ml["feature_importance"]),
        fraud_score=ml["fraud_score"],
        fraud_flags=json.dumps(ml["fraud_flags"]),
        model_version=ml["model_version"],
    )
    db.add(val)
    await db.flush()
    await db.refresh(val)

    return ValuationOut(
        id=val.id,
        property_id=prop.id,
        market_value_low=ml["market_value_low"],
        market_value_high=ml["market_value_high"],
        distress_value_low=ml["distress_value_low"],
        distress_value_high=ml["distress_value_high"],
        resale_potential_index=ml["resale_potential_index"],
        time_to_sell_min=ml["time_to_sell_min"],
        time_to_sell_max=ml["time_to_sell_max"],
        confidence_score=ml["confidence_score"],
        llm_explanation=explanation,
        risk_flags=risk_flags,
        shap_values=[SHAPItem(**s) for s in ml["shap_values"]],
        feature_importance=ml["feature_importance"],
        fraud_score=ml["fraud_score"],
        fraud_flags=ml["fraud_flags"],
        model_version=ml["model_version"],
        created_at=val.created_at,
    )


@router.get("/valuation/{vid}")
async def get_valuation(vid: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Valuation).where(Valuation.id == vid))
    val = result.scalar_one_or_none()
    if not val:
        raise HTTPException(404, "Valuation not found")
    return val
