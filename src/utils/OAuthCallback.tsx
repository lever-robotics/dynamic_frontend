import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./SupabaseClient";
import { useAuth } from "./AuthProvider";

export const OAuthCallback = () => {
    const navigate = useNavigate();
    const { getValidToken } = useAuth();
    
    useEffect(() => {
      const handleCallback = async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const token = await getValidToken();
        
        try {
          // Exchange code for tokens via your backend
          const response = await fetch('/api/oauth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code: code, state: state })
          });
          
          if (!response.ok) throw new Error('Failed to exchange code');
                    
          // Redirect to success page
          navigate('/settings/connections?success=true');
        } catch (error) {
          navigate('/error?reason=exchange_failed');
        }
      };
      
		handleCallback();
	}, [navigate, getValidToken]);

	return <div>Completing connection...</div>;
};