'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, BarChart3, Shield, Activity, TrendingUp, GitBranch, ChevronRight } from 'lucide-react';

const METRICS = [
  { v: '₹42T', l: 'India Mortgage Market', c: '#00E5FF' },
  { v: '~35%', l: 'Avg Valuation Variance', c: '#FFB800' },
  { v: '3–7×', l: 'Faster With AI',         c: '#00D68F' },
  { v: '98%',  l: 'Fraud Detection Rate',   c: '#FF3D71' },
];

const FEATURES = [
  { icon: Brain,      title: 'AI Valuation Engine',   desc: 'XGBoost ensemble delivering market value ranges with confidence intervals calibrated to Indian micro-markets.',  c: '#00E5FF' },
  { icon: BarChart3,  title: 'Liquidity Scoring',     desc: 'Neural net resale potential index (0–100) combining demand signals, asset fungibility, and legal quality.',         c: '#FFB800' },
  { icon: Shield,     title: 'Fraud Detection',       desc: 'Isolation Forest anomaly detection flags size inflation, location mismatches, and unrealistic valuations.',         c: '#FF3D71' },
  { icon: Brain,      title: 'LLM Explainability',    desc: 'GPT-4o generated underwriting memos — why this value, why this risk flag. Template fallback included.',            c: '#7C3AED' },
  { icon: Activity,   title: 'What-If Simulator',     desc: 'Adjust any parameter and watch valuation, liquidity, and risk scores update instantly.',                           c: '#00D68F' },
  { icon: TrendingUp, title: 'Market Intelligence',   desc: 'City-level demand indices, circle rate benchmarks, listing density, and price momentum signals.',                  c: '#FFB800' },
];

const DEMO_CARDS = [
  { l: 'Market Value',    v: '₹1.05Cr – ₹1.25Cr', c: '#00E5FF' },
  { l: 'Distress Value',  v: '₹82L – ₹98L',        c: '#FF3D71' },
  { l: 'Resale Index',    v: '74 / 100',            c: '#FFB800' },
  { l: 'Time to Sell',    v: '45–75 days',          c: '#00D68F' },
  { l: 'Confidence',      v: '0.71 / 1.0',          c: '#7C3AED' },
  { l: 'Fraud Risk',      v: 'LOW — 0.06',          c: '#00D68F' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-navy bg-grid overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 bg-navy/80 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan flex items-center justify-center">
            <span className="text-navy font-mono font-bold text-xs">Q</span>
          </div>
          <span className="font-display font-bold text-base">QUANTARA <span className="text-cyan">AI</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-dim">
          {['Features','How It Works','Demo'].map(t => (
            <a key={t} href={`#${t.toLowerCase().replace(/ /g,'-')}`} className="hover:text-cyan transition-colors">{t}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-dim hover:text-white px-4 py-2 transition-colors">Login</Link>
          <Link href="/auth/register" className="text-sm bg-cyan text-navy font-bold px-4 py-2 rounded-lg hover:opacity-90">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(0,229,255,.12) 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            Smart India Hackathon 2025 — Fintech Track
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-3 leading-tight">
            QUANTARA <span className="text-cyan">AI</span>
          </h1>
          <p className="text-dim text-lg font-mono italic mb-4">"Quantifying Value. Decoding Liquidity."</p>
          <p className="max-w-2xl mx-auto text-dim text-base md:text-lg mb-10 leading-relaxed">
            The Bloomberg Terminal for Real Estate Collateral. AI-powered valuation, resale liquidity scoring,
            and fraud detection for NBFCs — in seconds, not weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-cyan text-navy font-bold px-8 py-3.5 rounded-xl hover:opacity-90 glow-c transition-all">
              Launch Platform <ChevronRight size={18} />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 border border-border text-white font-medium px-8 py-3.5 rounded-xl hover:border-cyan/40 transition-colors">
              Sign In <Activity size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} transition={{ duration:.9, delay:.35 }}
          className="mt-20 max-w-4xl mx-auto glass p-6 glow-c">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-pink" /><span className="w-3 h-3 rounded-full bg-gold" /><span className="w-3 h-3 rounded-full bg-green" />
            <span className="text-dim font-mono text-xs ml-2">quantara-ai — valuation-dashboard</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DEMO_CARDS.map((c, i) => (
              <motion.div key={c.l} initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.5 + i*.08 }}
                className="bg-dark border border-border rounded-xl p-4 text-left">
                <p className="text-dim text-xs mb-1">{c.l}</p>
                <p className="font-display font-bold text-sm" style={{ color: c.c }}>{c.v}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Metrics */}
      <section className="py-16 px-6 border-y border-border bg-dark/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {METRICS.map((m) => (
            <motion.div key={m.l} initial={{ opacity:0 }} whileInView={{ opacity:1 }}>
              <p className="text-4xl md:text-5xl font-display font-extrabold mb-2" style={{ color: m.c }}>{m.v}</p>
              <p className="text-dim text-sm">{m.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-3">Enterprise AI Intelligence</h2>
            <p className="text-dim max-w-xl mx-auto text-sm">Every layer of the valuation stack — rebuilt with production-grade AI.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} transition={{ delay: i*.07 }}
                className="glass p-6 hover:border-cyan/30 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.c+'22' }}>
                  <f.icon size={20} style={{ color: f.c }} />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-dim text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div initial={{ opacity:0, scale:.96 }} whileInView={{ opacity:1, scale:1 }}
          className="max-w-2xl mx-auto glass p-12 glow-c">
          <h2 className="text-3xl font-display font-extrabold mb-3">Ready to Transform Underwriting?</h2>
          <p className="text-dim mb-8 text-sm">Join the platform built for the ₹42T Indian mortgage market.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-cyan text-navy font-bold px-10 py-4 rounded-xl hover:opacity-90 text-lg">
            Start Now — It's Free <ChevronRight size={20} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-dim text-xs font-mono">
        © 2025 QUANTARA AI · "Quantifying Value. Decoding Liquidity." · Smart India Hackathon
      </footer>
    </div>
  );
}
