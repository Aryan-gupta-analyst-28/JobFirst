import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://blldwgmzpmxvvkiklgvm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbGR3Z216cG14dnZraWtsZ3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODgyMzQsImV4cCI6MjA5OTg2NDIzNH0.7SCTe_Nstl8B6mBgtKaS7xKCfChRv2rA5SOc79Y1fOE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)