import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./SupabaseClient";

// export const OAuthCallback = () => {
//     const navigate = useNavigate();
    
//     useEffect(() => {
//       const handleCallback = async () => {
//         const params = new URLSearchParams(window.location.search);
//         const code = params.get('code');
//         const state = params.get('state');
        
//         // Verify state
//         if (state !== sessionStorage.getItem('oauth_state')) {
//           navigate('/error?reason=invalid_state');
//           return;
//         }
        
//         try {
//             const { data: session } = await supabase.auth.getSession();
//           // Exchange code for tokens via your backend
//           const response = await fetch('/api/oauth/google/callback', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${session.session?.access_token}`
//             },
//             body: JSON.stringify({ code })
//           });
          
//           if (!response.ok) throw new Error('Failed to exchange code');
          
//           // Clear state
//           sessionStorage.removeItem('oauth_state');
          
//           // Redirect to success page
//           navigate('/settings/connections?success=true');
//         } catch (error) {
//           navigate('/error?reason=exchange_failed');
//         }
//       };
      
//       handleCallback();
//     }, [navigate]);
    
//     return <div>Completing connection...</div>;
//   };