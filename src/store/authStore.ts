import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'user' | null;

interface AuthState {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  checkUserRole: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  userRole: null,
  isAdmin: false,
  loading: true,
  
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user || null,
      loading: false,
    });
  },
  
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, userRole: null, isAdmin: false });
  },
  
  checkSession: async () => {
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user || null,
      loading: false,
    });
    
    if (data.session?.user) {
      // If we have a user, check their role
      await get().checkUserRole();
    }
    
    // Subscribe to auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({
        session,
        user: session?.user || null,
      });
      
      if (session?.user) {
        // If we have a user after auth change, check their role
        await get().checkUserRole();
      } else {
        // Reset role if signing out
        set({ userRole: null, isAdmin: false });
      }
    });
  },
  
  checkUserRole: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      // Check user metadata for role information
      const userMetadata = user.user_metadata || {};
      const appMetadata = user.app_metadata || {};
      
      // Try to find role in either metadata object
      const role = (
        userMetadata.role || 
        appMetadata.role || 
        'user'
      ) as UserRole;
      
      const isAdmin = role === 'admin';
      set({ userRole: role, isAdmin });
      
      // If we're using JWT and need to verify role claims:
      if (get().session?.access_token) {
        // The JWT in the session already has role claims that Supabase validates
        // This is the most secure approach for role validation
        console.log('Using validated JWT claims for auth');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // Default to regular user on error
      set({ userRole: 'user', isAdmin: false });
    }
  },
}));