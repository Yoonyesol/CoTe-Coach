import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    // 깃허브 배포 시에는 레포지토리 이름을, 로컬 개발 시에는 루트(/)를 사용
    base: '/',
    plugins: [react(), tailwindcss()],
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },
    server: {
      proxy: {
        '/api/v3': {
          target: 'https://solved.ac',
          changeOrigin: true,
        },
      },
    },
    // 빌드 결과물이 dist 폴더로 나가도록 명시 (gh-pages 연동)
    build: {
      outDir: 'dist',
    }
  }
})