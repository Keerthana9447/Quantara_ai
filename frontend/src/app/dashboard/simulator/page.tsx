'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, GitBranch, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BASE = {
  address:'Banjara Hills', city:'Hyderabad', state:'Telangana',
  property_type:'residential', area_sqft:1100, age_years:8,
  rera_registered:true, legal_status:'Freehold', occupancy:'Self-occupied',
};

const PRESETS = [
  { label:'Premium Location', property:{ ...BASE, address:'Jubilee Hills', city:'Hyderabad' } },
  { label:'Older Property',   property:{ ...BASE, age_years:22 } },
  { label:'Larger Area',      property:{ ...BASE, area_sqft:2200 } },
  { label:'Commercial Use',   property:{ ...BASE, property_type:'commercial' } },
];

const INR = (n:number) =>
  n>=10_000_000?`₹${(n/10_000_000).toFixed(2)}Cr`:n>=100_000?`₹${(n/100_000).toFixed(1)}L`:`₹${n.toLocaleString('en-IN')}`;

const TT = { contentStyle:{ background:'#111827', border:'1px solid #1E2D45', borderRadius:8, color:'#E2E8F0', fontSize:12 } };

export default function SimulatorPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.post('/simulate', { base: BASE, scenarios: PRESETS });
      setResult(res.data);
    } catch (e:any) {
      toast.error(e?.response?.data?.detail || 'Simulation failed');
    } finally { setLoading(false); }
  };

  const chartData = result
    ? [result.base, ...result.scenarios].map((s:any) => ({
        name: s.label,
        'Value (₹L)': Math.round((s.market_value_low + s.market_value_high) / 2 / 100_000),
        'Resale Index': Math.round(s.resale_potential_index),
      }))
    : [];

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl mb-1">What-If Simulator</h1>
        <p className="text-dim text-sm">Compare how changes in property characteristics affect valuation, liquidity, and risk.</p>
      </div>

      <div className="glass p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-white text-sm font-semibold">Base: Banjara Hills, Hyderabad — Apartment, 1,100 sqft, 8yr, Freehold</p>
          <p className="text-dim text-xs mt-0.5">4 pre-loaded scenarios: Premium Location · Older · Larger · Commercial</p>
        </div>
        <button onClick={run} disabled={loading}
          className="flex items-center gap-2 bg-cyan text-navy font-bold px-6 py-2.5 rounded-xl hover:opacity-90 text-sm flex-shrink-0">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <GitBranch size={15} />}
          {loading ? 'Running…' : 'Run Simulation'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-5">
          {/* Scenario cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[{ ...result.base, label:'Base Case', delta_value:null, delta_liquidity:null }, ...result.scenarios].map((s:any, i:number) => (
              <div key={s.label} className={`glass p-4 ${i===0?'border-cyan/40':''}`}>
                {i===0 && <span className="text-xs font-mono text-cyan block mb-1.5">BASE</span>}
                <p className="font-display font-bold text-white text-xs mb-3 leading-tight">{s.label}</p>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-dim text-xs">Mkt Value (mid)</p>
                    <p className="text-cyan font-bold text-sm">{INR((s.market_value_low+s.market_value_high)/2)}</p>
                    {s.delta_value !== null && (
                      <span className={`flex items-center gap-1 text-xs font-mono font-bold ${s.delta_value>0?'text-green':'text-pink'}`}>
                        {s.delta_value>0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                        {s.delta_value>0?'+':''}{INR(Math.abs(s.delta_value))}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-dim text-xs">Resale Index</p>
                    <p className="text-gold font-bold text-sm">{s.resale_potential_index.toFixed(0)} / 100</p>
                    {s.delta_liquidity !== null && (
                      <span className={`text-xs font-mono font-bold ${s.delta_liquidity>0?'text-green':'text-pink'}`}>
                        {s.delta_liquidity>0?'+':''}{s.delta_liquidity.toFixed(1)} pts
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-dim text-xs">Time to Sell</p>
                    <p className="text-white font-bold text-xs">{s.time_to_sell_min}–{s.time_to_sell_max}d</p>
                  </div>
                  <div>
                    <p className="text-dim text-xs">Confidence</p>
                    <p className="text-green font-bold text-xs">{(s.confidence_score*100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="glass p-5">
            <p className="font-display font-bold text-sm mb-4">Scenario Comparison Chart</p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData} barSize={22}>
                <XAxis dataKey="name" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ color:'#64748B', fontSize:11 }} />
                <Bar yAxisId="l" dataKey="Value (₹L)"   fill="#00E5FF" radius={[4,4,0,0]} />
                <Bar yAxisId="r" dataKey="Resale Index" fill="#FFB800" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {!result && !loading && (
        <div className="glass p-14 text-center text-dim">
          <GitBranch size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Click "Run Simulation" to compare all scenarios side-by-side.</p>
        </div>
      )}
    </div>
  );
}
