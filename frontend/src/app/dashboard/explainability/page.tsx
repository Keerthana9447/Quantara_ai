'use client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SHAP = [
  { feature:'Location Premium (Banjara Hills)', value:18.2, impact:'positive' },
  { feature:'Residential Demand',               value:12.4, impact:'positive' },
  { feature:'RERA Registration',                value:9.1,  impact:'positive' },
  { feature:'High-Demand Micro-Market',         value:8.7,  impact:'positive' },
  { feature:'Optimal Size (1100 sqft)',          value:6.3,  impact:'positive' },
  { feature:'Market Competition',               value:-7.3, impact:'negative' },
  { feature:'Building Age (8yrs)',              value:-4.1, impact:'negative' },
];

const LIQUIDITY = [
  { factor:'City Demand',        score:82 },
  { factor:'Locality Quality',   score:74 },
  { factor:'Asset Fungibility',  score:68 },
  { factor:'Legal Title',        score:90 },
  { factor:'Property Age',       score:60 },
  { factor:'Area Configuration', score:78 },
];

const VALUE_DRIVERS = [
  { driver:'Metro Proximity',        pct:'+18%', c:'#00E5FF' },
  { driver:'Standard 2BHK Config',   pct:'+12%', c:'#00D68F' },
  { driver:'RERA Registered',        pct:'+9%',  c:'#00D68F' },
  { driver:'High-Demand Micro-Mkt',  pct:'+15%', c:'#00E5FF' },
  { driver:'Building Age >8yr',      pct:'-6%',  c:'#FF3D71' },
  { driver:'Market Competition',     pct:'-7%',  c:'#FF3D71' },
];

const TT = { contentStyle:{ background:'#111827', border:'1px solid #1E2D45', borderRadius:8, color:'#E2E8F0', fontSize:12 } };

const RINGS = [
  { label:'Data Completeness',       value:82, color:'#00E5FF' },
  { label:'Location Signal Quality', value:74, color:'#FFB800' },
  { label:'Model Certainty',         value:71, color:'#00D68F' },
];

export default function ExplainabilityPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl mb-1">Explainability Dashboard</h1>
        <p className="text-dim text-sm">SHAP analysis, feature importance, and AI reasoning — Banjara Hills sample valuation.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* SHAP Chart */}
        <div className="glass p-5">
          <p className="font-display font-bold text-sm mb-0.5">SHAP Feature Impact</p>
          <p className="text-dim text-xs mb-4">Positive = value-additive · Negative = value-detractor</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={SHAP} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={{ fill:'#64748B', fontSize:9 }} width={175} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {SHAP.map((e, i) => <Cell key={i} fill={e.impact==='positive'?'#00E5FF':'#FF3D71'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Liquidity Factors */}
        <div className="glass p-5">
          <p className="font-display font-bold text-sm mb-4">Liquidity Contributors</p>
          <div className="space-y-3">
            {LIQUIDITY.map((l) => (
              <div key={l.factor}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-dim">{l.factor}</span>
                  <span className="text-white font-mono font-bold">{l.score}</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${l.score}%` }} transition={{ duration:.8, delay:.1 }}
                    className="h-1.5 rounded-full"
                    style={{ background: l.score>=75?'#00D68F':l.score>=55?'#FFB800':'#FF3D71' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value Drivers */}
      <div className="glass p-5 mb-5">
        <p className="font-display font-bold text-sm mb-4">Value Drivers & Risk Flags</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VALUE_DRIVERS.map((d) => (
            <div key={d.driver} className="flex items-center justify-between p-3 rounded-xl border border-border">
              <span className="text-dim text-xs">{d.driver}</span>
              <span className="font-mono font-bold text-sm" style={{ color:d.c }}>{d.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Calibration */}
      <div className="glass p-5">
        <p className="font-display font-bold text-sm mb-5">Confidence Calibration</p>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {RINGS.map((r) => (
            <div key={r.label}>
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1E2D45" strokeWidth="2.5" />
                  <motion.circle
                    cx="18" cy="18" r="15.9" fill="none" stroke={r.color} strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ strokeDasharray:'0 100' }}
                    animate={{ strokeDasharray:`${r.value} 100` }}
                    transition={{ duration:1.2 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm" style={{ color:r.color }}>
                  {r.value}%
                </span>
              </div>
              <p className="text-dim text-xs">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
