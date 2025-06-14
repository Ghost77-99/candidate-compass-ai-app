
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  department: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  resume_url: string | null;
  profile_image_url: string | null;
  company: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sample skills pool for random assignment
  const sampleSkills = [
    ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
    ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
    ['Node.js', 'Express', 'MongoDB', 'GraphQL', 'Redis'],
    ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'Jenkins'],
    ['Product Management', 'Agile', 'Scrum', 'Data Analysis', 'User Research'],
    ['Figma', 'Adobe Creative Suite', 'User Experience', 'Prototyping', 'Wireframing'],
    ['Machine Learning', 'Python', 'TensorFlow', 'SQL', 'Data Visualization'],
    ['Marketing', 'SEO', 'Content Creation', 'Social Media', 'Google Analytics']
  ];

  const sampleBios = [
    "Passionate software developer with expertise in modern web technologies. Love building user-centric applications and learning new frameworks.",
    "Experienced product manager focused on delivering innovative solutions that drive business growth and enhance user experience.",
    "Creative designer with a keen eye for detail and user experience. Specialized in creating intuitive and visually appealing interfaces.",
    "Data-driven professional with strong analytical skills. Experienced in transforming complex data into actionable insights.",
    "Full-stack developer passionate about clean code and scalable architecture. Always eager to tackle challenging technical problems.",
    "Marketing professional with digital expertise. Focused on growth strategies and customer engagement through innovative campaigns."
  ];

  const sampleLocations = [
    'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 
    'Los Angeles, CA', 'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Remote'
  ];

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const createUserProfile = async (user: User, additionalData?: { name?: string; role?: string }) => {
    try {
      const randomSkillSet = sampleSkills[Math.floor(Math.random() * sampleSkills.length)];
      const randomBio = sampleBios[Math.floor(Math.random() * sampleBios.length)];
      const randomLocation = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
      const randomExperience = Math.floor(Math.random() * 8) + 1; // 1-8 years

      const profileData = {
        id: user.id,
        email: user.email,
        name: additionalData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: additionalData?.role || 'user',
        bio: randomBio,
        skills: randomSkillSet,
        location: randomLocation,
        experience_years: randomExperience,
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        department: additionalData?.role === 'hr' ? 'Human Resources' : 'Engineering'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const fetchOrCreateUserProfile = async (user: User, additionalData?: { name?: string; role?: string }) => {
    let profile = await fetchUserProfile(user.id);
    
    if (!profile) {
      console.log('Profile not found, creating new profile...');
      profile = await createUserProfile(user, additionalData);
    }
    
    return profile;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchOrCreateUserProfile(session.user);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchOrCreateUserProfile(session.user);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (data.user && !error) {
      // Create profile immediately after signup
      try {
        await createUserProfile(data.user, { name, role });
      } catch (profileError) {
        console.error('Error creating profile during signup:', profileError);
      }
    }

    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      signIn,
      signUp,
      logout
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
