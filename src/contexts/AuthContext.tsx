
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  user_type: 'hr' | 'job_seeker' | null;
  department: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  resume_url: string | null;
  profile_image_url: string | null;
  company: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, profileData?: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile after auth state change
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code !== 'PGRST116') { // Not found error
          throw error;
        }
        setProfile(null);
      } else {
        console.log('Profile fetched:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      // Profile will be fetched in the auth state change handler
    } else {
      setIsLoading(false);
    }
    
    return { error };
  };

  const signup = async (email: string, password: string, profileData?: any) => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard/user`,
        data: profileData
      }
    });

    if (!error && data.user) {
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          name: profileData?.name || '',
          location: profileData?.location || '',
          bio: profileData?.bio || '',
          skills: profileData?.skills || [],
          experience_years: profileData?.experience_years || 0,
          user_type: profileData?.user_type || 'job_seeker'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
    
    setIsLoading(false);
    return { error };
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
