import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthApolloProvider from './utils/ApolloProvider.tsx'
import { AuthProvider } from './utils/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
<StrictMode>
  <AuthProvider>
    <AuthApolloProvider>
      <App />
    </AuthApolloProvider>
  </AuthProvider>
  </StrictMode>,
)
