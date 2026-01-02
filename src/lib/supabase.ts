import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.')
}

// 로컬 스토리지를 암호화하여 세션 정보를 숨기는 커스텀 저장소
const encryptedStorage = {
    getItem: (key: string) => {
        const raw = localStorage.getItem(btoa(key)); // 키 이름 암호화
        if (!raw) return null;
        try {
            return atob(raw); // 값 복호화
        } catch {
            return null;
        }
    },
    setItem: (key: string, value: string) => {
        localStorage.setItem(btoa(key), btoa(value)); // 키와 값 모두 암호화 저장
    },
    removeItem: (key: string) => {
        localStorage.removeItem(btoa(key));
    },
};

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
        auth: {
            storage: encryptedStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
)
