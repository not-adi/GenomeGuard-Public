"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // { id, email, role, fullName }
    const [loading, setLoading] = useState(true);

    // ── Restore session from localStorage on mount ──
    useEffect(() => {
        const stored = localStorage.getItem("pg_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch { /* ignore corrupt data */ }
        }
        setLoading(false);
    }, []);

    // ── Signup — email + password + fullName → backend ──
    const signup = useCallback(async (email, password, fullName) => {
        const res = await fetch(`${API}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        const userData = { ...data.user };
        setUser(userData);
        localStorage.setItem("pg_user", JSON.stringify(userData));
        return userData;
    }, []);

    // ── Login — email + password → backend ──
    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        const userData = { ...data.user };
        setUser(userData);
        localStorage.setItem("pg_user", JSON.stringify(userData));
        return userData;
    }, []);

    // ── Google Sign-In — send ID token to backend for verification ──
    const loginWithGoogle = useCallback(async (idToken) => {
        const res = await fetch(`${API}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: idToken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google sign-in failed");

        const userData = { ...data.user };
        setUser(userData);
        localStorage.setItem("pg_user", JSON.stringify(userData));
        return userData;
    }, []);

    // ── Logout ──
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("pg_user");
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                signup,
                login,
                loginWithGoogle,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
