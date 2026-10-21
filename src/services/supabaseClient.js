import { createClient } from '@supabase/supabase-js';

// Safe fallbacks prevent blank-screen crashes if environment variables aren't set yet
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rjstzajvgevjceamcquk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3R6YWp2Z2V2amNlYW1jcXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NzU3MDYsImV4cCI6MjEwODA1MTcwNn0.Vkntamnf-dwT8WiB2eOZ2O4mS2-zkQwlGI6HwdJSfsA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);