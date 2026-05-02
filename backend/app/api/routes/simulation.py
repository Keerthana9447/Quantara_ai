from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.ml.engine import compute_valuation
from app.schemas.schemas import SimRequest, SimOut, SimResult

router = APIRouter()


@router.post("/simulate", response_model=SimOut)
async def simulate(req: SimRequest, _=Depends(get_current_user)):
    def _to_result(label: str, prop: object, delta_base: dict | None = None) -> SimResult:
        r = compute_valuation(prop)
        mid = (r["market_value_low"] + r["market_value_high"]) / 2
        dv = dliq = None
        if delta_base:
            base_mid = (delta_base["market_value_low"] + delta_base["market_value_high"]) / 2
            dv = round(mid - base_mid, 0)
            dliq = round(r["resale_potential_index"] - delta_base["resale_potential_index"], 1)
        return SimResult(
            label=label,
            market_value_low=r["market_value_low"],
            market_value_high=r["market_value_high"],
            resale_potential_index=r["resale_potential_index"],
            time_to_sell_min=r["time_to_sell_min"],
            time_to_sell_max=r["time_to_sell_max"],
            confidence_score=r["confidence_score"],
            delta_value=dv,
            delta_liquidity=dliq,
        )

    base_raw = compute_valuation(req.base)
    base_result = _to_result("Base Case", req.base)
    scenarios = [_to_result(s.label, s.property, base_raw) for s in req.scenarios]
    return SimOut(base=base_result, scenarios=scenarios)
