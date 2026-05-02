'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { api } from '@/lib/api';

const S = z.object({ email: z.string().email(), password: z.string().min(6) });
type F = z.infer<typeof S>;

export default function Login() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(S) });

  const onSubmit = async (d: F) => {
    try {
      const fd = new URLSearchParams({ username: d.email, password: d.password });
      const res = await api.post('/auth/login', fd.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      setAuth(res.data.access_token, res.data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy bg-grid flex items-center justify-center px-4">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan flex items-center justify-center">
              <span className="text-navy font-mono font-bold">Q</span>
            </div>
            <span className="font-display font-bold text-xl">QUANTARA <span className="text-cyan">AI</span></span>
          </Link>
          <p className="text-dim text-sm mt-2 font-mono italic">"Quantifying Value. Decoding Liquidity."</p>
        </div>

        <div className="glass p-8">
          <h1 className="font-display font-extrabold text-2xl mb-1">Sign In</h1>
          <p className="text-dim text-sm mb-6">Access the Quantara AI platform</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-dim block mb-1">Email</label>
              <input {...register('email')} type="email" className="inp" placeholder="analyst@nbfc.com" />
              {errors.email && <p className="text-pink text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs text-dim block mb-1">Password</label>
              <div className="relative">
                <input {...register('password')} type={show ? 'text' : 'password'} className="inp pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-pink text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-cyan text-navy font-bold py-3 rounded-xl hover:opacity-90 flex items-center justify-center gap-2 mt-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-dim text-sm mt-5">
            No account? <Link href="/auth/register" className="text-cyan hover:underline">Register</Link>
          </p>
        </div>

        <div className="mt-4 p-3 rounded-xl border border-gold/30 bg-gold/5 text-center">
          <p className="text-gold text-xs font-mono">Register first, then use your credentials to login</p>
        </div>
      </motion.div>
    </div>
  );
}
