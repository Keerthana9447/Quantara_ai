'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const S = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['analyst', 'viewer']),
});
type F = z.infer<typeof S>;

export default function Register() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(S), defaultValues: { role: 'analyst' },
  });

  const onSubmit = async (d: F) => {
    try {
      await api.post('/auth/register', d);
      toast.success('Account created! Please log in.');
      router.push('/auth/login');
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Registration failed');
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
        </div>
        <div className="glass p-8">
          <h1 className="font-display font-extrabold text-2xl mb-1">Create Account</h1>
          <p className="text-dim text-sm mb-6">Join the Quantara AI platform</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-dim block mb-1">Full Name</label>
              <input {...register('full_name')} className="inp" placeholder="Arjun Sharma" />
              {errors.full_name && <p className="text-pink text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="text-xs text-dim block mb-1">Email</label>
              <input {...register('email')} type="email" className="inp" placeholder="analyst@nbfc.com" />
              {errors.email && <p className="text-pink text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs text-dim block mb-1">Password (min 8 chars)</label>
              <input {...register('password')} type="password" className="inp" placeholder="••••••••" />
              {errors.password && <p className="text-pink text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-xs text-dim block mb-1">Role</label>
              <select {...register('role')} className="inp">
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-cyan text-navy font-bold py-3 rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Creating…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-dim text-sm mt-5">
            Have an account? <Link href="/auth/login" className="text-cyan hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
