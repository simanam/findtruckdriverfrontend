import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Validate URL to prevent crashes
const isValidUrl = (url: string | undefined) => {
    try {
        return url && new URL(url).protocol.startsWith('http');
    } catch {
        return false;
    }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl! : 'https://placeholder.supabase.co';
const finalKey = supabaseKey || 'placeholder-key';

const isConfigured = isValidUrl(supabaseUrl) && !!supabaseKey;

if (!isConfigured) {
    console.warn("Invalid or missing Supabase URL. Auth features will use placeholder.");
}

export const supabase = createClient(finalUrl, finalKey);
export { isConfigured };
