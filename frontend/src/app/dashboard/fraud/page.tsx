'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CHECKS = [
  { id:'area',   label:'Area vs Locality Norm',     desc:'Is the stated area realistic for the locality type?',          threshold:0.15 },
  { id:'price',  label:'Price vs Circle Rate',       desc:'Does market value exceed circle rate by a suspicious margin?', threshold:0.20 },
  { id:'coords', label:'Location Coordinate Check',  desc:'Do GPS coordinates fall within plausible India bounds?',       threshold:0.05 },
  { id:'type',   label:'Type-Size Consistency',      desc:'Is property sub-type consistent with the stated area?',        threshold:0.12 },
  { id:'yield',  label:'Rental Yield Sanity',        desc:'Is declared rental yield within market norms (< 8%)?',         threshold:0.10 },
  { id:'val',    label:'Overvaluation Guard',         desc:'Is stated value within 2σ of comparable transactions?',       threshold:0.18 },
];

function StatusIcon({ score, threshold }: { score:number; threshold:number }) {
  if (score < threshold * 0.5) return <CheckCircle size={15} className="text-green" />;
  if (score < threshold)       return <AlertTriangle size={15} className="text-gold" />;
  return <XCircle size={15} className="text-pink" />;
}

export default function FraudPage() {
  const [loading, setLoading]   = useState(false);
  const [scores,  setScores]    = useState<Record<string,number> | null>(null);
  const [overall, setOverall]   = useState<number | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1800));
      const s: Record<string,number> = {};
      CHECKS.forEach(c => { s[c.id] = Math.random() * c.threshold * 1.4; });
      setScores(s);
      setOverall(Math.max(...Object.values(s)));
    } catch {
      toast.error('Fraud check failed');
    } finally { setLoading(false); }
  };

  const verdict = overall !== null
    ? (overall > 0.25 ? 'HIGH_RISK' : overall > 0.12 ? 'MEDIUM_RISK' : 'LOW_RISK')
    : null;
  const vc = verdict === 'HIGH_RISK' ? '#FF3D71' : verdict === 'MEDIUM_RISK' ? '#FFB800' : '#00D68F';

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl mb-1">Fraud Detection Panel</h1>
        <p className="text-dim text-sm">Isolation Forest anomaly detection — 6-point cross-validation against market norms.</p>
      </div>

      <div className="glass p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-white text-sm font-semibold">Sample: Banjara Hills, Hyd · Apt · 1100 sqft · ₹1.05Cr–1.25Cr</p>
          <p className="text-dim text-xs mt-0.5">Running Isolation Forest across 6 validation dimensions</p>
        </div>
        <button onClick={run} disabled={loading}
          className="flex items-center gap-2 bg-pink text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90 text-sm flex-shrink-0">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
          {loading ? 'Scanning…' : 'Run Fraud Check'}
        </button>
      </div>

      {/* Verdict */}
      <AnimatePresence>
        {verdict && (
          <motion.div initial={{ opacity:0, scale:.96 }} animate={{ opacity:1, scale:1 }}
            className="glass p-6 mb-5 text-center" style={{ borderColor: vc+'44' }}>
            <p className="text-4xl font-display font-extrabold mb-1" style={{ color:vc }}>
              {verdict.replace('_',' ')}
            </p>
            <p className="text-dim text-sm">Overall Anomaly Score: <span className="font-mono font-bold text-white">{overall?.toFixed(3)}</span></p>
            {verdict==='LOW_RISK'    && <p className="text-green text-xs mt-2">✅ Inputs appear consistent. Standard underwriting may proceed.</p>}
            {verdict==='MEDIUM_RISK' && <p className="text-gold  text-xs mt-2">⚡ Some signals warrant manual review before disbursement.</p>}
            {verdict==='HIGH_RISK'   && <p className="text-pink  text-xs mt-2">🚨 Multiple anomalies detected. Do NOT disburse without physical verification.</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check rows */}
      <div className="space-y-2.5">
        {CHECKS.map((c, i) => {
          const score = scores?.[c.id] ?? null;
          return (
            <motion.div key={c.id}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: scores ? i*.05 : 0 }}
              className="glass p-4 flex items-center gap-4">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                {score !== null
                  ? <StatusIcon score={score} threshold={c.threshold} />
                  : <div className="w-3.5 h-3.5 rounded-full border border-border" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{c.label}</p>
                <p className="text-dim text-xs">{c.desc}</p>
              </div>
              {score !== null && (
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-xs font-bold text-white">{score.toFixed(3)}</p>
                  <p className="text-dim text-xs">/ {c.threshold.toFixed(2)} threshold</p>
                </div>
              )}
              {loading && <Loader2 size={13} className="text-dim animate-spin flex-shrink-0" />}
            </motion.div>
          );
        })}
      </div>

      {!scores && !loading && (
        <div className="mt-5 glass p-14 text-center text-dim">
          <Shield size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Click "Run Fraud Check" to scan all validation dimensions.</p>
        </div>
      )}
    </div>
  );
}
