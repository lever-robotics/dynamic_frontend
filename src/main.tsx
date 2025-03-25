import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './utils/AuthProvider.tsx'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
  // <StrictMode>
	<AuthProvider>
		<App />
	</AuthProvider>
  // </StrictMode>,
)
