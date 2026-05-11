import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      
      'process.env.REACT_APP_API_URL': JSON.stringify(env.VITE_APP_API_URL || 'http://petclinic-prod-alb-2142133629.us-east-1.elb.amazonaws.com'),
      'import.meta.env.VITE_APP_API_URL': JSON.stringify(env.VITE_APP_API_URL || 'http://petclinic-prod-alb-2142133629.us-east-1.elb.amazonaws.com')
    }
  }
})