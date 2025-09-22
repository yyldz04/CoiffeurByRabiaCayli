"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { authService } from "../utils/supabase/client";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (await authService.isLoggedIn()) {
          onLogin();
        }
      } catch {
        // User not logged in, continue to login form
      }
    };
    checkAuth();
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Sign in with Supabase Auth
      await authService.signIn(credentials.email, credentials.password);
      onLogin();
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : "Anmeldung fehlgeschlagen");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase">Admin Login</h1>
          <p className="text-white/60 uppercase">COIFFEUR BY RABIA CAYLI  </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-white/20 p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <label className="block tracking-[0.05em] mb-2 uppercase">
                  E-Mail
                </label>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                  placeholder="contact@coiffeurbyrabiacayli.at"
                  required
                />
              </div>

              <div>
                <label className="block tracking-[0.05em] mb-2 uppercase">
                  Passwort
                </label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                  placeholder="PASSWORT"
                  required
                />
              </div>

              {error && (
                <div className="border border-red-500/30 bg-red-500/5 p-3 text-center">
                  <p className="text-red-400 tracking-[0.05em] uppercase">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black border border-white px-8 py-3 tracking-[0.1em] hover:bg-white/90 transition-colors uppercase disabled:opacity-50"
              >
                {isLoading ? "ANMELDUNG..." : "ANMELDEN"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center text-white/40 text-sm">
          <p className="uppercase tracking-[0.05em]">
            Supabase Auth Integration
          </p>
        </div>
      </div>
    </div>
  );
}