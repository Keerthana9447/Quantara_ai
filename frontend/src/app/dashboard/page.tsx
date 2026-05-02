'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const CITIES = [
  { city:'Mumbai',    price:19500 },{ city:'Delhi',     price:12500 },
  { city:'Bangalore', price:8500 }, { city:'Pune',      price:7400 },
  { city:'Hyderabad', price:6800 }, { city:'Chennai',   price:6200 },
];
const TREND = [
  { m:'Jul',v:6200 },{ m:'Aug',v:6350 },{ m:'Sep',v:6400 },
  { m:'Oct',v:6550 },{ m:'Nov',v:6700 },{ m:'Dec',v:6800 },
];
const TT = { contentStyle:{ background:'#111827', border:'1px solid #1E2D45', borderRadius:8, color:'#E2E8F0', fontSize:12 } };

function Stat({ title, value, sub, color, icon: I }: any) {
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} className="glass p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="text-dim text-xs">{title}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color+'22' }}>
          <I size={14} style={{ color }} />
        </div>
      </div>
      <p className="font-display font-extrabold text-2xl text-white mb-0.5">{value}</p>
      <p className="text-dim text-xs">{sub}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats } = useQuery({ queryKey:['stats'], queryFn:() => api.get('/admin/stats').then(r=>r.data) });

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display font-extrabold text-3xl mb-1">Command Center</h1>
        <p className="text-dim text-sm">Real-time AI valuation analytics for your NBFC portfolio.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat title="Total Valuations"  value={stats?.total_valuations ?? '—'} sub="All time"       color="#00E5FF" icon={Activity} />
        <Stat title="Valuations Today"  value={stats?.valuations_today  ?? '—'} sub="Last 24h"      color="#FFB800" icon={BarChart3} />
        <Stat title="Avg Confidence"    value={stats ? `${(stats.avg_confidence*100).toFixed(0)}%` : '—'} sub="Model certainty" color="#00D68F" icon={TrendingUp} />
        <Stat title="Fraud Flags"       value={stats?.fraud_flags_today ?? '—'} sub="Today"         color="#FF3D71" icon={Shield} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="glass p-5">
          <p className="font-display font-bold text-sm mb-0.5">Market Price / Sq.Ft by City</p>
          <p className="text-dim text-xs mb-4">₹ residential avg</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={CITIES} barSize={24}>
              <XAxis dataKey="city" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="price" fill="#00E5FF" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-5">
          <p className="font-display font-bold text-sm mb-0.5">Hyderabad Price Trend — 6M</p>
          <p className="text-dim text-xs mb-4">₹/sqft residential</p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <XAxis dataKey="m" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto','auto']} />
              <Tooltip {...TT} />
              <Line type="monotone" dataKey="v" stroke="#FFB800" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-5">
        <p className="font-display font-bold text-sm mb-4">Quick Actions</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href:'/dashboard/analyze',   label:'New Valuation',    desc:'Analyze a property', c:'#00E5FF' },
            { href:'/dashboard/simulator', label:'What-If Simulator',desc:'Compare scenarios',  c:'#FFB800' },
            { href:'/dashboard/fraud',     label:'Fraud Check',      desc:'Run anomaly scan',   c:'#FF3D71' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-cyan/40 transition-all group">
              <div>
                <p className="font-semibold text-sm text-white">{a.label}</p>
                <p className="text-dim text-xs mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight size={15} style={{ color:a.c }} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
