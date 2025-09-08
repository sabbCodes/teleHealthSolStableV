'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  profile_image?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  wallet_address?: string;
};

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useUserProfile(): UseUserProfileReturn {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchUserProfile = async (session: Session | null = null) => {
    console.log('fetchUserProfile called with session:', session ? 'session exists' : 'no session');
    
    if (!session) {
      console.log('No session provided, trying to get current session...');
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }
        
        if (!currentSession) {
          console.warn('No active session found');
          setUserProfile(null);
          setIsAuthenticated(false);
          setError('No active session. Please sign in.');
          setLoading(false);
          return;
        }
        
        session = currentSession;
        console.log('Retrieved current session successfully');
      } catch (error) {
        console.error('Error in session retrieval:', error);
        setError('Failed to retrieve session');
        setLoading(false);
        return;
      }
    }

    try {
      console.log('Starting to fetch user profile...');
      setLoading(true);
      setError(null);
      
      // Small delay to prevent UI flickering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Double check session is still valid
      if (!session) {
        console.warn('Session lost during fetch, trying to recover...');
        const { data: { session: currentSession }, error: sessionCheckError } = await supabase.auth.getSession();
        
        if (sessionCheckError || !currentSession) {
          console.error('Session recovery failed:', sessionCheckError || 'No session found');
          setUserProfile(null);
          setIsAuthenticated(false);
          setError('Session expired. Please sign in again.');
          setLoading(false);
          return;
        }
        
        session = currentSession;
        console.log('Session recovered successfully');
      }

      // Get the current user
      console.log('Fetching user from auth...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User fetch result:', { user, userError });

      if (userError || !user) {
        const errorMsg = userError?.message || 'No user object returned';
        console.warn('No user found in session:', errorMsg);
        setUserProfile(null);
        setIsAuthenticated(false);
        setError('User not found in session.');
        setLoading(false);
        return;
      }

      // First, get the base user profile
      console.log('Fetching base user profile for user ID:', user.id);
      
      let userProfile;
      let profileError;
      
      try {
        const result = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        userProfile = result.data;
        profileError = result.error;
        
        console.log('Base profile query result:', { userProfile, profileError });

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw new Error(`Failed to load user profile: ${profileError.message}`);
        }
        
        if (!userProfile) {
          throw new Error('No profile data returned from database');
        }
      
        // Debug: Check the structure of the user profile
        console.log('User profile structure:', {
          id: userProfile.id,
          email: userProfile.email,
          user_type: userProfile.user_type,
          created_at: userProfile.created_at,
          rawData: userProfile
        });
      } catch (error) {
        console.error('Error in profile fetch:', error);
        setError('Failed to load user profile');
        setLoading(false);
        return;
      }
      
      console.log('Found base user profile:', {
        id: userProfile.id,
        email: userProfile.email,
        user_type: userProfile.user_type,
        created_at: userProfile.created_at
      });

      // Determine which profile table to query based on user type
      const profileTable = `${userProfile.user_type}_profiles` as const;
      console.log(`Looking for detailed profile in table: ${profileTable} for user_profile_id:`, userProfile.id);
      
      // Debug: Check if the table exists and its structure
      try {
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('get_table_columns', { table_name: profileTable });
          
        if (tableError) {
          console.warn(`Error checking table ${profileTable} structure:`, tableError);
        } else {
          console.log(`Table ${profileTable} structure:`, tableInfo);
        }
      } catch (e) {
        console.warn(`Failed to check table ${profileTable} structure:`, e);
      }
      
      // Get the detailed profile information
      let detailedProfile = null;
      try {
        // First, try to get the detailed profile using the user_profile_id
        console.log(`Querying ${profileTable} for user_profile_id:`, userProfile.id);
        const { data, error } = await supabase
          .from(profileTable)
          .select('*')
          .eq('user_profile_id', userProfile.id)
          .maybeSingle();
          
        console.log('Detailed profile query result:', { data, error });

        if (error) {
          console.warn(`Error fetching ${userProfile.user_type} profile:`, error);
          
          // Check if the error is due to table not found or permission issues
          if (error.message.includes('permission denied') || error.message.includes('does not exist')) {
            console.error(`Possible issue with table ${profileTable} or permissions`);
          }
        } else if (data) {
          detailedProfile = data;
          console.log('Detailed profile found:', detailedProfile);
        } else {
          console.warn(`No ${userProfile.user_type} profile found for user_profile_id ${userProfile.id}`);
          
          // Check if there are any records in the profile table at all
          const { count, error: countError } = await supabase
            .from(profileTable)
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            console.warn(`Error counting records in ${profileTable}:`, countError);
          } else {
            console.log(`Total records in ${profileTable}:`, count);
            
            // If there are records, log the first few to check their structure
            if (count && count > 0) {
              const { data: sampleData } = await supabase
                .from(profileTable)
                .select('*')
                .limit(5);
              console.log(`Sample records from ${profileTable}:`, sampleData);
            }
          }
        }
        
        // If we still don't have a profile, check if the user has completed onboarding
        if (!detailedProfile) {
          console.log('No detailed profile found, checking if user needs to complete onboarding');
          // You might want to redirect to onboarding or show a message to the user
          setError('Please complete your profile setup to continue');
        }
      } catch (err) {
        console.error('Unexpected error fetching detailed profile:', err);
      }

      // Combine the user profile with detailed profile data
      const profileData: UserProfile = {
        ...userProfile,
        ...(detailedProfile || {}),
        email: user.email || '',
      };

      // Add full_name field if first_name or last_name exists
      if (detailedProfile && (detailedProfile.first_name || detailedProfile.last_name)) {
        profileData.full_name = [
          detailedProfile.first_name,
          detailedProfile.last_name
        ]
          .filter(Boolean)
          .join(' ')
          .trim();
      }

      setUserProfile(profileData);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    console.log('Setting up auth state change listener...');
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, hasSession: !!session });
      console.log('Auth state changed:', event);
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        try {
          await fetchUserProfile(session);
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          if (isMounted) {
            setError('Failed to load user profile');
            setLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUserProfile(null);
          setIsAuthenticated(false);
          setError('Please sign in to continue');
          setLoading(false);
        }
      }
    });

    // Initial fetch
    const fetchInitialSession = async () => {
      console.log('Starting initial session fetch...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }
        
        console.log('Initial session fetch result:', { hasSession: !!session });
        
        if (session) {
          console.log('Session found, fetching user profile...');
          await fetchUserProfile(session);
        } else if (isMounted) {
          console.log('No active session found');
          setLoading(false);
          setError('No active session found');
        }
      } catch (error) {
        console.error('Error in initial session fetch:', error);
        if (isMounted) {
          setError('Failed to initialize session');
          setLoading(false);
        }
      }
    };

    fetchInitialSession();

    // Cleanup
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { 
    userProfile, 
    loading, 
    error,
    isAuthenticated
  };
}

// Helper function to get initials from a name
export function getInitials(name?: string): string {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
