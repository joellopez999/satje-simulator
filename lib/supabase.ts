import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Configuración dinámica para desarrollo y producción
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Singleton pattern for Supabase clients to avoid multiple instances in dev
const globalForSupabase = global as unknown as {
  supabase: SupabaseClient
  supabaseAdmin: SupabaseClient
}

// Cliente de Supabase para operaciones del cliente
export const supabase = globalForSupabase.supabase || createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Cliente con service role para operaciones administrativas
export const supabaseAdmin = globalForSupabase.supabaseAdmin || createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase
  globalForSupabase.supabaseAdmin = supabaseAdmin
}

// Debug: log service role key presence
console.log('Supabase Service Role Key provided:', !!supabaseServiceRoleKey)