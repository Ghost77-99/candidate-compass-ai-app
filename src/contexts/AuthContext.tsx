import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'hr' | 'admin';
  department?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  resume_url?: string;
  profile_image_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (email: string, password: string, userData?: { name?: string; role?: 'user' | 'hr' }) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchOrCreateUserProfile(session.user);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch or create user profile when user signs in
          setTimeout(async () => {
            await fetchOrCreateUserProfile(session.user);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User, role: 'user' | 'hr' = 'user') => {
    try {
      const profileData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: role,
        experience_years: 0,
        skills: []
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  const fetchOrCreateUserProfile = async (user: User) => {
    try {
      // First, try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        // Profile exists, set it
        const profileData: Profile = {
          ...data,
          role: (data.role as 'user' | 'hr' | 'admin') || 'user'
        };
        setProfile(profileData);
      } else {
        // Profile doesn't exist, create one
        console.log('Profile not found, creating new profile for user:', user.id);
        
        // Determine role from user metadata or default to 'user'
        const userRole = user.user_metadata?.role || 'user';
        
        const newProfile = await createUserProfile(user, userRole);
        if (newProfile) {
          const profileData: Profile = {
            ...newProfile,
            role: (newProfile.role as 'user' | 'hr' | 'admin') || 'user'
          };
          setProfile(profileData);
          
          toast({
            title: "Welcome!",
            description: "Your profile has been created successfully.",
          });
        } else {
          toast({
            title: "Profile Error",
            description: "There was an issue setting up your profile. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchOrCreateUserProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return { error };
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
      }

      return { error: null };
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return { error: err };
    }
  };

  const signup = async (email: string, password: string, userData?: { name?: string; role?: 'user' | 'hr' }) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData?.name || email.split('@')[0],
            role: userData?.role || 'user'
          }
        }
      });

      if (error) {
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        }
        
        toast({
          title: "Signup Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return { error };
      }

      // If user was created successfully
      if (data.user) {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account before signing in.",
        });
      }

      setIsLoading(false);
      return { error: null };
    } catch (err) {
      console.error('Signup error:', err);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return { error: err };
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      login, 
      signup, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
