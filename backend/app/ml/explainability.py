"""
Quantara AI — LLM Explanation Engine
GPT-4o when key is set, otherwise high-quality template.
"""
from __future__ import annotations
import os


async def generate_explanation(result: dict, prop: object) -> str:
    key = os.getenv("OPENAI_API_KEY", "")
    if key and key.startswith("sk-"):
        try:
            return await _openai(result, prop, key)
        except Exception:
            pass
    return _template(result, prop)


async def _openai(result: dict, prop: object, key: str) -> str:
    import httpx

    city = getattr(prop, "city", "N/A")
    ptype = getattr(prop, "property_type", "property")
    if hasattr(ptype, "value"):
        ptype = ptype.value
    area = getattr(prop, "area_sqft", 0)
    age = getattr(prop, "age_years", 0)
    rera = getattr(prop, "rera_registered", False)
    legal = getattr(prop, "legal_status", "N/A")

    mv_mid = (result["market_value_low"] + result["market_value_high"]) / 2

    prompt = (
        f"You are a senior NBFC underwriter. Write a concise 3-sentence collateral valuation note "
        f"for a {ptype} in {city}, {area:,.0f} sq ft, {age}yr old, {legal} title"
        f"{', RERA registered' if rera else ''}. "
        f"Market value: ₹{mv_mid/100000:.1f}L. Resale index: {result['resale_potential_index']}/100. "
        f"Confidence: {result['confidence_score']:.2f}. Fraud score: {result['fraud_score']:.2f}. "
        f"Be specific, use Bloomberg Terminal style, mention key value driver and main risk."
    )

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": "gpt-4o", "messages": [{"role": "user", "content": prompt}], "max_tokens": 220},
        )
        data = r.json()
        return data["choices"][0]["message"]["content"].strip()


def _template(result: dict, prop: object) -> str:
    city = getattr(prop, "city", "the subject city")
    ptype = getattr(prop, "property_type", "property")
    if hasattr(ptype, "value"):
        ptype = ptype.value
    area = getattr(prop, "area_sqft", 0)
    age = getattr(prop, "age_years", 0)
    rera = getattr(prop, "rera_registered", False)

    mv_mid = (result["market_value_low"] + result["market_value_high"]) / 2
    rpi = result["resale_potential_index"]
    conf = result["confidence_score"]
    fraud = result["fraud_score"]

    liq_str = (
        "strong resale liquidity underpinned by active micro-market demand" if rpi >= 75
        else "moderate resale liquidity with expected absorption within 2–3 months" if rpi >= 55
        else "constrained resale liquidity — recommend conservative LTV positioning"
    )
    conf_str = (
        "high model confidence supported by comprehensive input signals" if conf >= 0.75
        else "moderate confidence — field verification advised for final underwriting" if conf >= 0.60
        else "lower confidence due to limited data — physical inspection mandatory"
    )
    rera_note = "RERA registration enhances legal standing and buyer acceptance. " if rera else ""
    fraud_note = (
        f" ⚠️ Anomaly score {fraud:.2f} — manual review before disbursement." if fraud > 0.30 else ""
    )

    dv_pct_lo = int((result["distress_value_low"] / result["market_value_low"]) * 100) if result["market_value_low"] else 0
    dv_pct_hi = int((result["distress_value_high"] / result["market_value_high"]) * 100) if result["market_value_high"] else 0

    return (
        f"This {ptype} asset in {city} ({area:,.0f} sq ft, {age}-yr vintage) is mid-valued at "
        f"₹{mv_mid/100000:.1f}L, reflecting {liq_str}. "
        f"{rera_note}"
        f"Distress recovery estimated at {dv_pct_lo}–{dv_pct_hi}% of market value with "
        f"liquidation window of {result['time_to_sell_min']}–{result['time_to_sell_max']} days. "
        f"Assessment carries {conf_str}.{fraud_note}"
    )
