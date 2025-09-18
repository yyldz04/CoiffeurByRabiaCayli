// Supabase configuration - now using environment variables
export const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "jdaufpavhbgrloypbjvv"
export const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXVmcGF2aGJncmxveXBianZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDYzMDEsImV4cCI6MjA3MzUyMjMwMX0.BEf_m8aIw0F2syrPrTKD1b07H2Dv4smyRle5sQf2Kn4"
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jdaufpavhbgrloypbjvv.supabase.co"