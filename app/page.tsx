'use client';
import {useEffect,useMemo,useState} from 'react';import{createClient,type Session}from'@supabase/supabase-js';
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
// The remainder of this page is preserved from the existing application.
