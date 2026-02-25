import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext';
import { Toaster } from './components/ui/toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </AuthProvider>
  </StrictMode>,
);
