"""
Quantara AI — Pydantic v2 Schemas
Python 3.14.2 compatible — no deprecated typing imports.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, field_validator


class PropertyTypeEnum(str, Enum):
    residential = "residential"
    commercial = "commercial"
    industrial = "industrial"
    land = "land"


class UserRoleEnum(str, Enum):
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"


# ── Auth ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8)
    role: UserRoleEnum = UserRoleEnum.analyst


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Property ─────────────────────────────────────────────────────────────────
class PropertyInput(BaseModel):
    address: str = Field(..., min_length=3)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)
    property_type: PropertyTypeEnum
    sub_type: str | None = None
    area_sqft: float = Field(..., gt=0, le=100_000)
    age_years: int = Field(..., ge=0, le=100)
    floor_level: int | None = None
    legal_status: str | None = None
    occupancy: str | None = None
    rental_yield: float | None = Field(None, ge=0, le=25)
    rera_registered: bool = False


# ── Valuation ────────────────────────────────────────────────────────────────
class ValuationRequest(BaseModel):
    property: PropertyInput
    include_fraud_check: bool = True
    include_explanation: bool = True


class RiskFlag(BaseModel):
    code: str
    label: str
    severity: str  # low | medium | high
    description: str


class SHAPItem(BaseModel):
    feature: str
    value: float
    impact: str  # positive | negative


class ValuationOut(BaseModel):
    id: str
    property_id: str
    market_value_low: float
    market_value_high: float
    distress_value_low: float
    distress_value_high: float
    resale_potential_index: float
    time_to_sell_min: int
    time_to_sell_max: int
    confidence_score: float
    llm_explanation: str | None
    risk_flags: list[RiskFlag]
    shap_values: list[SHAPItem]
    feature_importance: dict
    fraud_score: float
    fraud_flags: list[str]
    model_version: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Simulation ───────────────────────────────────────────────────────────────
class SimScenario(BaseModel):
    label: str
    property: PropertyInput


class SimRequest(BaseModel):
    base: PropertyInput
    scenarios: list[SimScenario] = Field(..., max_length=6)


class SimResult(BaseModel):
    label: str
    market_value_low: float
    market_value_high: float
    resale_potential_index: float
    time_to_sell_min: int
    time_to_sell_max: int
    confidence_score: float
    delta_value: float | None = None
    delta_liquidity: float | None = None


class SimOut(BaseModel):
    base: SimResult
    scenarios: list[SimResult]
