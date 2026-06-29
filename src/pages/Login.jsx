
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login({ auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth) {
    return (
      <Navigate
        to={auth.role === "admin" ? "/admin" : "/portal"}
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error("No session was returned after signing in.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Unable to sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-icon">⌁</div>

          <div>
            <h1>North Rift</h1>
            <p>Connectivity Manager</p>
          </div>
        </div>

        <h2>Sign in</h2>
        <p>Enter your authorised account details.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {errorMessage && (
            <p className="form-error">{errorMessage}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
