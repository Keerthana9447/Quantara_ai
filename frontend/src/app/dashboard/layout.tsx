'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Search, GitBranch, BarChart3, Shield, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/store';

const NAV = [
  { href: '/dashboard',                icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/analyze',        icon: Search,          label: 'Analyze Property' },
  { href: '/dashboard/simulator',      icon: GitBranch,       label: 'What-If Simulator' },
  { href: '/dashboard/explainability', icon: BarChart3,       label: 'Explainability' },
  { href: '/dashboard/fraud',          icon: Shield,          label: 'Fraud Detection' },
  { href: '/dashboard/admin',          icon: Settings,        label: 'Admin' },
];

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { token, user, logout } = useAuth();

  useEffect(() => { if (!token) router.push('/auth/login'); }, [token, router]);
  if (!token) return null;

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-dark border-r border-border">
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan flex items-center justify-center flex-shrink-0">
              <span className="text-navy font-mono font-bold text-xs">Q</span>
            </div>
            <span className="font-display font-bold text-sm">QUANTARA <span className="text-cyan">AI</span></span>
          </Link>
        </div>
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-green font-mono">AI Engine Online</span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = path === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                  active ? 'bg-cyan/10 text-cyan border border-cyan/20' : 'text-dim hover:text-white hover:bg-border/40'
                }`}>
                <item.icon size={14} />
                <span>{item.label}</span>
                {active && <ChevronRight size={10} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-violet flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.full_name?.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.full_name}</p>
              <p className="text-dim text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/auth/login'); }}
            className="w-full flex items-center gap-1.5 text-dim hover:text-pink text-xs py-1 transition-colors">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-grid">
        <motion.div key={path} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:.25 }} className="p-7 min-h-full">
          {children}
        </motion.div>
      </main>
    </div>
  );
}
