import { create } from 'zustand';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { isAuthorizedAdmin } from '../config/admin';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  initialized: false,
  error: null,
  setUser: (user) => {
    const isAdmin = user ? isAuthorizedAdmin(user.uid, user.email) : false;
    
    // If user is authenticated but NOT an admin, sign them out
    if (user && !isAdmin) {
      signOut(auth);
      set({ 
        user: null, 
        isAdmin: false, 
        loading: false, 
        initialized: true,
        error: 'UNAUTHORIZED_ADMIN'
      });
      return;
    }

    set({ user, isAdmin, loading: false, initialized: true });
  },
  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  logout: async () => {
    await signOut(auth);
    set({ user: null, isAdmin: false, error: null });
  },
  clearError: () => set({ error: null }),
}));

// Initialize listener
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
