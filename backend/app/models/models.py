"""
Quantara AI — SQLAlchemy Models
Compatible with SQLite (default) and PostgreSQL.
Python 3.14.2 — uses built-in type syntax throughout.
"""
from __future__ import annotations

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.core.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"


class PropertyType(str, enum.Enum):
    residential = "residential"
    commercial = "commercial"
    industrial = "industrial"
    land = "land"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default=UserRole.analyst.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    valuations: Mapped[list[Valuation]] = relationship("Valuation", back_populates="user")


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    property_type: Mapped[str] = mapped_column(String(30), nullable=False)
    sub_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    area_sqft: Mapped[float] = mapped_column(Float, nullable=False)
    age_years: Mapped[int] = mapped_column(Integer, nullable=False)
    floor_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    legal_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    occupancy: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rental_yield: Mapped[float | None] = mapped_column(Float, nullable=True)
    rera_registered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    valuations: Mapped[list[Valuation]] = relationship("Valuation", back_populates="property")


class Valuation(Base):
    __tablename__ = "valuations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    market_value_low: Mapped[float] = mapped_column(Float, nullable=False)
    market_value_high: Mapped[float] = mapped_column(Float, nullable=False)
    distress_value_low: Mapped[float] = mapped_column(Float, nullable=False)
    distress_value_high: Mapped[float] = mapped_column(Float, nullable=False)
    resale_potential_index: Mapped[float] = mapped_column(Float, nullable=False)
    time_to_sell_min: Mapped[int] = mapped_column(Integer, nullable=False)
    time_to_sell_max: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)

    llm_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_flags: Mapped[str | None] = mapped_column(Text, nullable=True)   # JSON string
    shap_values: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    feature_importance: Mapped[str | None] = mapped_column(Text, nullable=True)
    fraud_score: Mapped[float] = mapped_column(Float, default=0.0)
    fraud_flags: Mapped[str | None] = mapped_column(Text, nullable=True)

    model_version: Mapped[str] = mapped_column(String(20), default="1.0.0")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    property: Mapped[Property] = relationship("Property", back_populates="valuations")
    user: Mapped[User] = relationship("User", back_populates="valuations")
