'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Brain, Shield, TrendingUp, Clock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const S = z.object({
  address:        z.string().min(3),
  city:           z.string().min(2),
  state:          z.string().min(2),
  latitude:       z.number().optional(),
  longitude:      z.number().optional(),
  property_type:  z.enum(['residential','commercial','industrial','land']),
  sub_type:       z.string().optional(),
  area_sqft:      z.number().min(50).max(100000),
  age_years:      z.number().min(0).max(100),
  legal_status:   z.string().optional(),
  occupancy:      z.string().optional(),
  rental_yield:   z.number().optional(),
  rera_registered:z.boolean(),
});
type F = z.infer<typeof S>;

const STEPS = [
  'Extracting Location Intelligence',
  'Running XGBoost Valuation Model',
  'Scoring Liquidity Index',
  'Checking Fraud Signals',
  'Generating LLM Underwriting Memo',
];

const INR = (n: number) =>
  n >= 10_000_000 ? `₹${(n/10_000_000).toFixed(2)}Cr`
  : n >= 100_000  ? `₹${(n/100_000).toFixed(1)}L`
  : `₹${n.toLocaleString('en-IN')}`;

const TT = { contentStyle: { background:'#111827', border:'1px solid #1E2D45', borderRadius:8, color:'#E2E8F0', fontSize:12 } };

function Severity({ s }: { s: string }) {
  const c: Record<string,string> = { low:'#00D68F', medium:'#FFB800', high:'#FF3D71' };
  return <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold uppercase" style={{ color: c[s]??'#fff', background:(c[s]??'#fff')+'22' }}>{s}</span>;
}

export default function AnalyzePage() {
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<F>({
    resolver: zodResolver(S),
    defaultValues: { city:'Hyderabad', state:'Telangana', property_type:'residential', area_sqft:1100, age_years:8, rera_registered:true, legal_status:'Freehold', occupancy:'Self-occupied' },
  });

  const onSubmit = async (data: F) => {
    setAnalyzing(true); setResult(null); setStep(0);
    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 550));
      setStep(i + 1);
    }
    try {
      const res = await api.post('/analyze-property', { property: data, include_fraud_check: true, include_explanation: true });
      setResult(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Analysis failed — ensure backend is running');
    } finally { setAnalyzing(false); }
  };

  const radar = result ? [
    { s:'Value',     A: Math.min(100, (result.market_value_high / 20_000_000) * 100) },
    { s:'Liquidity', A: result.resale_potential_index },
    { s:'Confidence',A: result.confidence_score * 100 },
    { s:'Safety',    A: (1 - result.fraud_score) * 100 },
    { s:'Speed',     A: Math.max(0, 100 - result.time_to_sell_max / 3) },
  ] : [];

  const Field = ({ label, children }: any) => (
    <div><label className="text-xs text-dim block mb-1">{label}</label>{children}</div>
  );

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl mb-1">Analyze Property</h1>
        <p className="text-dim text-sm">Enter collateral details to generate AI-powered valuation, liquidity, and risk analysis.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Form */}
        <div className="glass p-6">
          <p className="text-cyan text-xs font-mono font-bold uppercase tracking-wider mb-5">Property Details</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Field label="Address / Locality">
              <input {...register('address')} className="inp" placeholder="Banjara Hills, Hyderabad" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City"><input {...register('city')} className="inp" /></Field>
              <Field label="State"><input {...register('state')} className="inp" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude (opt)"><input {...register('latitude',{valueAsNumber:true})} className="inp" placeholder="17.41" /></Field>
              <Field label="Longitude (opt)"><input {...register('longitude',{valueAsNumber:true})} className="inp" placeholder="78.40" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Property Type">
                <select {...register('property_type')} className="inp">
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="land">Land</option>
                </select>
              </Field>
              <Field label="Sub-Type"><input {...register('sub_type')} className="inp" placeholder="Apartment / Villa" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Area (sq ft)"><input {...register('area_sqft',{valueAsNumber:true})} type="number" className="inp" /></Field>
              <Field label="Age (years)"><input {...register('age_years',{valueAsNumber:true})} type="number" className="inp" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Legal Status">
                <select {...register('legal_status')} className="inp">
                  <option value="Freehold">Freehold</option>
                  <option value="Leasehold">Leasehold</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </Field>
              <Field label="Occupancy">
                <select {...register('occupancy')} className="inp">
                  <option value="Self-occupied">Self-occupied</option>
                  <option value="Rented">Rented</option>
                  <option value="Vacant">Vacant</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 items-center">
              <Field label="Rental Yield (%)">
                <input {...register('rental_yield',{valueAsNumber:true})} type="number" step="0.1" className="inp" placeholder="3.5" />
              </Field>
              <div className="flex items-center gap-2 mt-5">
                <input {...register('rera_registered')} type="checkbox" id="rera" className="w-4 h-4 accent-cyan" />
                <label htmlFor="rera" className="text-sm text-white">RERA Registered</label>
              </div>
            </div>
            <button type="submit" disabled={analyzing}
              className="w-full bg-cyan text-navy font-bold py-3 rounded-xl hover:opacity-90 flex items-center justify-center gap-2 mt-1">
              {analyzing ? <Loader2 size={17} className="animate-spin" /> : <Brain size={17} />}
              {analyzing ? 'Analyzing…' : 'Run AI Analysis'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence>
            {analyzing && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="glass p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={14} className="text-cyan animate-pulse" />
                  <span className="text-cyan font-mono text-xs font-bold">AI Processing Pipeline</span>
                </div>
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-2.5 py-1.5 text-xs transition-colors ${i < step ? 'text-green' : i === step ? 'text-cyan' : 'text-dim'}`}>
                    {i < step ? <CheckCircle size={13} /> : i === step ? <Loader2 size={13} className="animate-spin" /> : <div className="w-3 h-3 rounded-full border border-current opacity-30" />}
                    {s}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l:'Market Value',   v:`${INR(result.market_value_low)} – ${INR(result.market_value_high)}`, c:'#00E5FF', I:TrendingUp },
                    { l:'Distress Value', v:`${INR(result.distress_value_low)} – ${INR(result.distress_value_high)}`, c:'#FF3D71', I:AlertTriangle },
                    { l:'Resale Index',   v:`${result.resale_potential_index.toFixed(0)} / 100`, c:'#FFB800', I:Activity },
                    { l:'Time to Sell',   v:`${result.time_to_sell_min}–${result.time_to_sell_max} days`, c:'#00D68F', I:Clock },
                  ].map(m => (
                    <div key={m.l} className="glass p-3">
                      <div className="flex items-center gap-1 mb-1"><m.I size={11} style={{ color:m.c }} /><span className="text-dim text-xs">{m.l}</span></div>
                      <p className="font-display font-bold text-xs" style={{ color:m.c }}>{m.v}</p>
                    </div>
                  ))}
                </div>

                <div className="glass p-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-dim text-xs">Confidence Score</span>
                    <span className="font-mono font-bold text-cyan text-xs">{(result.confidence_score*100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5">
                    <motion.div initial={{ width:0 }} animate={{ width:`${result.confidence_score*100}%` }} transition={{ duration:1 }} className="h-1.5 rounded-full bg-cyan" />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-dim text-xs">Fraud Risk</span>
                    <span className={`font-mono font-bold text-xs ${result.fraud_score>0.3?'text-pink':result.fraud_score>0.15?'text-gold':'text-green'}`}>
                      {result.fraud_score>0.3?'⚠️ HIGH':result.fraud_score>0.15?'⚡ MEDIUM':'✅ LOW'} — {result.fraud_score.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="glass p-4">
                  <p className="text-dim text-xs mb-2">Asset Profile Radar</p>
                  <ResponsiveContainer width="100%" height={170}>
                    <RadarChart data={radar}>
                      <PolarGrid stroke="#1E2D45" />
                      <PolarAngleAxis dataKey="s" tick={{ fill:'#64748B', fontSize:10 }} />
                      <Radar dataKey="A" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip {...TT} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {result.llm_explanation && (
                  <div className="glass p-4 border-l-2 border-cyan">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={13} className="text-cyan" />
                      <span className="text-cyan text-xs font-mono font-bold">AI Underwriting Memo</span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{result.llm_explanation}</p>
                  </div>
                )}

                {result.risk_flags?.length > 0 && (
                  <div className="glass p-4">
                    <p className="text-dim text-xs mb-3">Risk Flags</p>
                    <div className="space-y-2">
                      {result.risk_flags.map((f: any) => (
                        <div key={f.code} className="flex items-center justify-between">
                          <span className="text-white text-xs">{f.label}</span>
                          <Severity s={f.severity} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !analyzing && (
            <div className="glass p-12 text-center text-dim">
              <Brain size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Fill in property details and run the AI analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
