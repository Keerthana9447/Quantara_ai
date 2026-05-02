"""
Quantara AI — ML Valuation Engine
Pure Python implementation — no external ML libs required at runtime.
Simulates XGBoost + Isolation Forest with calibrated Indian real-estate priors.
Python 3.14.2 compatible.
"""
from __future__ import annotations

import math
import random


# ── City base rates ₹/sqft ───────────────────────────────────────────────────
CITY_RATES: dict[str, dict[str, float]] = {
    "hyderabad":  {"residential": 6500,  "commercial": 9000,  "industrial": 4500,  "land": 3500},
    "bangalore":  {"residential": 8000,  "commercial": 11000, "industrial": 5500,  "land": 5000},
    "bengaluru":  {"residential": 8000,  "commercial": 11000, "industrial": 5500,  "land": 5000},
    "mumbai":     {"residential": 18000, "commercial": 22000, "industrial": 9000,  "land": 12000},
    "chennai":    {"residential": 6000,  "commercial": 8500,  "industrial": 4000,  "land": 3000},
    "pune":       {"residential": 7000,  "commercial": 9500,  "industrial": 5000,  "land": 4000},
    "delhi":      {"residential": 12000, "commercial": 15000, "industrial": 7000,  "land": 8000},
    "gurugram":   {"residential": 10000, "commercial": 14000, "industrial": 6000,  "land": 7000},
    "noida":      {"residential": 8500,  "commercial": 11000, "industrial": 5000,  "land": 6000},
    "kolkata":    {"residential": 5500,  "commercial": 7500,  "industrial": 3500,  "land": 3000},
}
DEFAULT_RATE: dict[str, float] = {
    "residential": 5000, "commercial": 7000, "industrial": 3500, "land": 2500
}

# ── Premium locality multipliers ─────────────────────────────────────────────
LOCALITY_MULT: dict[str, float] = {
    "banjara hills": 1.35, "jubilee hills": 1.55, "hitech city": 1.40,
    "gachibowli": 1.30, "madhapur": 1.28, "kondapur": 1.20,
    "koramangala": 1.50, "indiranagar": 1.45, "whitefield": 1.30,
    "hsr layout": 1.35, "bellandur": 1.25,
    "bandra": 1.70, "powai": 1.40, "andheri": 1.20, "juhu": 1.60,
    "velachery": 1.15, "adyar": 1.30, "t nagar": 1.25, "anna nagar": 1.20,
    "kalyani nagar": 1.35, "kothrud": 1.20, "hinjewadi": 1.15,
    "south delhi": 1.60, "dwarka": 1.10, "vasant kunj": 1.50,
}

CITY_DEMAND: dict[str, float] = {
    "mumbai": 12, "bangalore": 10, "bengaluru": 10,
    "hyderabad": 8, "delhi": 9, "gurugram": 8,
    "pune": 7, "chennai": 6, "noida": 7, "kolkata": 5,
}


def _locality_mult(address: str) -> float:
    addr = address.lower()
    for locality, mult in LOCALITY_MULT.items():
        if locality in addr:
            return mult
    return 1.0


def _age_depreciation(age: int, ptype: str) -> float:
    if ptype == "land":
        return 1.0
    rate = 0.012 if ptype == "residential" else 0.015
    return max(0.50, 1.0 - rate * age)


def _legal_mult(legal: str | None, rera: bool) -> float:
    base = 1.0
    if legal:
        ls = legal.lower()
        if "freehold" in ls:
            base += 0.05
        elif "leasehold" in ls:
            base -= 0.08
        elif "disputed" in ls:
            base -= 0.22
    if rera:
        base += 0.04
    return max(0.60, base)


def _liquidity(
    ptype: str, city: str, loc_mult: float,
    age: int, area: float, legal_mult: float,
) -> float:
    base = {"residential": 68, "commercial": 55, "land": 62, "industrial": 38}.get(ptype, 55)
    base += CITY_DEMAND.get(city.lower(), 4)

    if loc_mult > 1.4:   base += 15
    elif loc_mult > 1.2: base += 8
    elif loc_mult > 1.0: base += 3

    if age < 5:          base += 8
    elif age < 10:       base += 4
    elif age > 20:       base -= 12
    elif age > 15:       base -= 6

    if ptype == "residential" and 600 <= area <= 1500:
        base += 6
    elif area > 3000:
        base -= 5

    if legal_mult < 0.85:
        base -= 15

    return min(99.0, max(15.0, base + random.uniform(-2.5, 2.5)))


def _time_to_sell(liquidity: float, ptype: str) -> tuple[int, int]:
    ranges = {
        "residential": (20, 120),
        "commercial":  (45, 210),
        "industrial":  (90, 365),
        "land":        (60, 300),
    }
    lo, hi = ranges.get(ptype, (30, 180))
    factor = 1.0 - (liquidity / 100) * 0.70
    t_min = max(lo, int(lo + factor * (hi - lo) * 0.35))
    t_max = int(lo + factor * (hi - lo))
    return t_min, t_max


def _confidence(
    area: float, age: int, loc_mult: float,
    has_coords: bool, rera: bool,
) -> float:
    s = 0.52
    if has_coords:       s += 0.08
    if rera:             s += 0.06
    if loc_mult > 1.2:  s += 0.04
    if 150 <= area <= 6000: s += 0.06
    if age < 20:         s += 0.04
    return round(min(0.93, s + random.uniform(-0.03, 0.03)), 2)


def _shap(loc_mult: float, age: int, area: float, legal_mult: float, rera: bool, ptype: str) -> list[dict]:
    items: list[dict] = []
    if loc_mult > 1.3:
        items.append({"feature": "Location Premium", "value": round((loc_mult - 1) * 100, 1), "impact": "positive"})
    if rera:
        items.append({"feature": "RERA Registration", "value": 4.2, "impact": "positive"})
    if age < 8:
        items.append({"feature": "New Construction", "value": round((8 - age) * 1.2, 1), "impact": "positive"})
    elif age > 15:
        items.append({"feature": "Building Age", "value": round((age - 15) * 1.5, 1), "impact": "negative"})
    if legal_mult > 1.03:
        items.append({"feature": "Freehold Title", "value": 5.1, "impact": "positive"})
    elif legal_mult < 0.95:
        items.append({"feature": "Legal Risk", "value": round((1 - legal_mult) * 100, 1), "impact": "negative"})
    if ptype == "residential" and 800 <= area <= 1400:
        items.append({"feature": "Optimal Size Config", "value": 6.3, "impact": "positive"})
    if ptype == "residential":
        items.append({"feature": "Residential Demand", "value": 7.8, "impact": "positive"})
    return items


def _fraud(prop: dict, market_value: float) -> tuple[float, list[str]]:
    """Simple rule-based fraud / anomaly detection (Isolation Forest logic)."""
    flags: list[str] = []
    score = 0.05  # baseline

    area = prop.get("area_sqft", 1000)
    age = prop.get("age_years", 5)
    ptype = prop.get("property_type", "residential")
    rental_yield = prop.get("rental_yield")
    lat = prop.get("latitude")
    lon = prop.get("longitude")

    pps = (market_value / area) if area > 0 else 0

    if ptype == "residential":
        if area < 150:
            flags.append("Unusually small area for residential property")
            score += 0.25
        elif area > 25000:
            flags.append("Extremely large area — verify measurement unit")
            score += 0.20

    if ptype == "residential" and age > 40 and pps > 15000:
        flags.append("Very old property with high ₹/sqft — verify structural condition")
        score += 0.15

    if rental_yield is not None:
        if rental_yield > 12:
            flags.append(f"Rental yield {rental_yield}% exceeds market norms (>12%)")
            score += 0.25
        elif rental_yield > 8:
            score += 0.08

    if lat is not None and lon is not None:
        if not (8.0 <= lat <= 37.6 and 68.0 <= lon <= 97.5):
            flags.append("GPS coordinates fall outside India bounding box")
            score += 0.40

    return round(min(0.99, score), 2), flags


def compute_valuation(prop: object) -> dict:
    """
    Main entry point — mirrors XGBoost + ensemble output structure.
    `prop` can be any object with the PropertyInput attributes.
    """
    city = str(getattr(prop, "city", "hyderabad")).lower().strip()
    ptype = getattr(prop, "property_type", "residential")
    if hasattr(ptype, "value"):
        ptype = ptype.value

    area = float(getattr(prop, "area_sqft", 1000))
    age = int(getattr(prop, "age_years", 5))
    rera = bool(getattr(prop, "rera_registered", False))
    legal = getattr(prop, "legal_status", "Freehold") or "Freehold"
    address = str(getattr(prop, "address", ""))

    base_rates = CITY_RATES.get(city, DEFAULT_RATE)
    base_rate = base_rates.get(ptype, 5000)

    loc_mult = _locality_mult(address)
    age_depr = _age_depreciation(age, ptype)
    legal_m  = _legal_mult(legal, rera)

    # Core valuation with Gaussian noise (simulates model uncertainty)
    center = base_rate * area * loc_mult * age_depr * legal_m
    center *= random.gauss(1.0, 0.04)

    spread = center * 0.10
    mv_lo = round(center - spread, -3)
    mv_hi = round(center + spread, -3)

    liq = _liquidity(ptype, city, loc_mult, age, area, legal_m)
    haircut = 0.70 + (liq / 100) * 0.12
    dv_lo = round(mv_lo * haircut, -3)
    dv_hi = round(mv_hi * haircut, -3)

    t_min, t_max = _time_to_sell(liq, ptype)
    conf = _confidence(
        area, age, loc_mult,
        bool(getattr(prop, "latitude", None) and getattr(prop, "longitude", None)),
        rera,
    )

    feature_imp = {
        "Location": round(min(40, loc_mult * 35), 1),
        "Area": round(min(25, area / 1000 * 20), 1),
        "Age & Condition": round(age_depr * 20, 1),
        "Legal Status": round(legal_m * 15, 1),
        "Market Dynamics": round(random.uniform(5, 12), 1),
    }

    prop_dict = {
        "area_sqft": area, "age_years": age, "property_type": ptype,
        "city": city, "rental_yield": getattr(prop, "rental_yield", None),
        "latitude": getattr(prop, "latitude", None),
        "longitude": getattr(prop, "longitude", None),
    }
    fraud_score, fraud_flags = _fraud(prop_dict, (mv_lo + mv_hi) / 2)

    return {
        "market_value_low": mv_lo,
        "market_value_high": mv_hi,
        "distress_value_low": dv_lo,
        "distress_value_high": dv_hi,
        "resale_potential_index": round(liq, 1),
        "time_to_sell_min": t_min,
        "time_to_sell_max": t_max,
        "confidence_score": conf,
        "shap_values": _shap(loc_mult, age, area, legal_m, rera, ptype),
        "feature_importance": feature_imp,
        "fraud_score": fraud_score,
        "fraud_flags": fraud_flags,
        "model_version": "1.0.0",
    }
