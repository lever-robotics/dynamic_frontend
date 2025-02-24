export const initiateGoogleAuth = async () => {
    // Generate and store state for CSRF protection
    // const state = crypto.randomUUID();
    // sessionStorage.setItem('oauth_state', state);
    
    // // Redirect to Google OAuth
    // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    //   client_id: "715836038842-r2vk9jj8bd00pmrikdvlbvf57443mvcd.apps.googleusercontent.com",
    //   redirect_uri: `${window.location.origin}`,
    //   response_type: 'code',
    //   scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    //   state,
    //   access_type: 'offline'
    // })}`;

    const response = await fetch('http://localhost:4000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      console.log(data);
  };