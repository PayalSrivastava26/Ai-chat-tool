import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cxizlhzfffrgiyxgyjje.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aXpsaHpmZmZyZ2l5eGd5amplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjI4NTQsImV4cCI6MjA2NTk5ODg1NH0.uhP-HSf1_baGCtUnScs2TmupM9kZy3hxQN5QPOZKvMM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
