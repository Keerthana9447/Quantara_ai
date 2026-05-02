'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Activity, Users, Shield, Cpu, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_CALLS = [
  { t:'00:00',v:12 },{ t:'04:00',v:4  },{ t:'08:00',v:48 },
  { t:'12:00',v:92 },{ t:'16:00',v:74 },{ t:'20:00',v:38 },{ t:'23:00',v:22 },
];

const MODEL_LOGS = [
  { id:'v1.0.0', date:'2025-12-01', samples:1200, rmse:'0.082', status:'active'  },
  { id:'v0.9.3', date:'2025-11-01', samples:800,  rmse:'0.094', status:'retired' },
  { id:'v0.9.0', date:'2025-10-01', samples:500,  rmse:'0.112', status:'retired' },
];

const TT = { contentStyle:{ background:'#111827', border:'1px solid #1E2D45', borderRadius:8, color:'#E2E8F0', fontSize:12 } };

function Stat({ label, value, icon:I, color }: any) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-dim text-xs">{label}</p>
        <I size={14} style={{ color }} />
      </div>
      <p className="font-display font-extrabold text-2xl text-white">{value}</p>
    </motion.div>
  );
}

export default function AdminPage() {
  const { data: stats, refetch, isFetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    refetchInterval: 30_000,
  });

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl mb-1">Admin Dashboard</h1>
          <p className="text-dim text-sm">Platform health, model monitoring, and usage analytics.</p>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 text-cyan border border-cyan/30 px-4 py-2 rounded-xl text-sm hover:bg-cyan/10 transition-colors">
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Active Users"      value={stats?.active_users      ?? '—'} icon={Users}    color="#00E5FF" />
        <Stat label="API Calls Today"   value={stats?.api_calls_today   ?? '—'} icon={Activity}  color="#FFB800" />
        <Stat label="Fraud Flags Today" value={stats?.fraud_flags_today ?? '—'} icon={Shield}    color="#FF3D71" />
        <Stat label="Model Drift Score" value={stats ? stats.model_drift_score.toFixed(3) : '—'} icon={Cpu} color="#00D68F" />
      </div>

      <div className="glass p-5 mb-5">
        <p className="font-display font-bold text-sm mb-4">API Call Volume — Today</p>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={API_CALLS}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
            <XAxis dataKey="t" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Line type="monotone" dataKey="v" stroke="#00E5FF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass p-5">
        <p className="font-display font-bold text-sm mb-4">Model Registry</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Version','Deployed','Training Samples','RMSE','Status'].map(h => (
                  <th key={h} className="text-left pb-2 text-dim text-xs font-medium pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODEL_LOGS.map(m => (
                <tr key={m.id} className="border-b border-border/40">
                  <td className="py-3 pr-6 font-mono text-cyan text-xs">{m.id}</td>
                  <td className="py-3 pr-6 text-dim text-xs">{m.date}</td>
                  <td className="py-3 pr-6 text-white text-xs">{m.samples.toLocaleString()}</td>
                  <td className="py-3 pr-6 font-mono text-xs text-white">{m.rmse}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${m.status==='active'?'bg-green/20 text-green':'bg-border text-dim'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
