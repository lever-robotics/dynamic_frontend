import { useAuth0 } from '@auth0/auth0-react';

export const LoginButton = () => {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    console.log('Auth state:', { isAuthenticated, user });

    if (isAuthenticated) {
        return (
            <div>
                <p>Logged in as: {user?.email}</p>
                <button
                    onClick={() => logout({ returnTo: window.location.origin })}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => loginWithRedirect()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
        >
            Log In
        </button>
    );
};