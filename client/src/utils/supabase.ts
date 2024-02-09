import { createClient } from '@supabase/supabase-js'

const projectURL = import.meta.env.VITE_PROJECT_URL
const projectKey = import.meta.env.VITE_API_KEY

export const supabase = createClient(projectURL, projectKey)
