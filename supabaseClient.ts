import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uhwbwymfcblzwpecnupa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVod2J3eW1mY2JsendwZWNudXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODAzNzQsImV4cCI6MjA1MjA1NjM3NH0.48rG1Pi65pxIBFEw-6GnUF2uObBa79r5fAW_LZ9q_m8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 