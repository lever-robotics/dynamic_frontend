import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./utils/AuthProvider.tsx";
import AuthApolloProvider from "./utils/ApolloProvider.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { OAuthCallback } from "./utils/OAuthCallback.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<AuthApolloProvider>
				<BrowserRouter>
					<Routes>
						{/* <Route path="/oauth/callback" element={<OAuthCallback />} /> */}
						<Route path="/" element={<App />} />
						{/* other specific routes */}
						{/* <Route path="*" element={<OAuthCallback />} />{" "} */}
						{/* Catch all unmatched paths */}
					</Routes>
				</BrowserRouter>
			</AuthApolloProvider>
		</AuthProvider>
	</StrictMode>,
);
// Simple NotFound component
function NotFound() {
	return (
		<div>
			<h1>404: Page Not Found</h1>
			<p>The page you're looking for doesn't exist.</p>
		</div>
	);
}
