import { useState } from "react";
import { signUp, signIn, signOut } from "./auth";
import { supabase } from "./supabase";

export default function AuthComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  async function handleSignUp() {
    try {
      const data = await signUp(email, password);
      console.log("Sign-up successful:", data);
    } catch (error) {
      console.error("Sign-up error:", error.message);
    }
  }

  async function handleSignIn() {
    try {
      const data = await signIn(email, password);
      setUser(data.user);
      console.log("Sign-in successful:", data);
    } catch (error) {
      console.error("Sign-in error:", error.message);
    }
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
    console.log("Signed out successfully");
  }

  return (
    <div>
      <h2>Authentication</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>

      {user && <p>Welcome, {user.email}</p>}
    </div>
  );
}
