import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User { id: string; email: string; full_name: string; role: string; }
interface Auth {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = create<Auth>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'q-auth' }
  )
);
