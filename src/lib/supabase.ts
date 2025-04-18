
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wmcmihtejmzhtcwurxvv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtY21paHRlam16aHRjd3VyeHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NzM1MjMsImV4cCI6MjA2MDU0OTUyM30.8KmBeJBuleFbNKrjtSyw96Wk83X3YByeCLzm2B71JVs";

// Check if the URL and key are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anonymous Key is missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  },
  global: {
    fetch: (url, options) => {
      const fetchOptions = {
        ...options,
        timeout: 10000
      };
      
      return fetch(url, fetchOptions);
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 1 // Reduce realtime events to minimize load
    }
  }
});

// Helper for adding exponential backoff to Supabase requests
export const withBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 500
): Promise<T> => {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      retries++;
      if (retries >= maxRetries) throw error;
      
      // Check if this is a 400 error with "invalid input syntax" - don't retry these
      if (error?.code === "22P02" || 
          (error?.message && error.message.includes("invalid input syntax"))) {
        throw error;
      }
      
      // Calculate exponential backoff time with jitter
      const delay = baseDelay * Math.pow(1.5, retries) * (0.9 + Math.random() * 0.2);
      console.log(`Retrying Supabase request in ${delay}ms (attempt ${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
