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
};

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchUserProfile = async (session: Session | null = null) => {
    try {
      console.log('Starting to fetch user profile...');
      setLoading(true);
      setError(null);
      
      if (!session) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.warn('No active session found');
          setUserProfile(null);
          setIsAuthenticated(false);
          setError('No active session. Please sign in.');
          setLoading(false);
          return;
        }
        session = currentSession;
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.warn('No user found in session:', userError?.message);
        setUserProfile(null);
        setIsAuthenticated(false);
        setError('User not found in session.');
        setLoading(false);
        return;
      }

      // First, get the base user profile
      console.log('Fetching base user profile for user ID:', user.id);
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to load user profile');
      }
      
      // Debug: Check the structure of the user profile
      console.log('User profile structure:', {
        id: userProfile.id,
        email: userProfile.email,
        user_type: userProfile.user_type,
        created_at: userProfile.created_at,
        rawData: userProfile
      });
      
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
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        await fetchUserProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setIsAuthenticated(false);
        setError('Please sign in to continue');
      }
    });

    // Initial fetch
    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session);
      } else {
        setLoading(false);
      }
    };

    fetchInitialSession();

    // Cleanup
    return () => {
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

