"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"

export function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
    >
      Sign in with Google
    </button>
  )
}

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!username.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return false;
    }
    if (!/^[\w.+-]+@\w+\.\w+$/.test(email)) {
      setError("Invalid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login");
      } else {
        setError(data.error || "Signup failed.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Name</label>
          <input type="text" value={username} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small>Password must be at least 8 characters.</small>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button><p></p>
        <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="btn-submit"
      >
        Sign in with Google
      </button>
      </form>

      <div className="auth-footer">
        Already have an account? <a href="/login">Login</a>
      </div>
    </div>
  );
}
