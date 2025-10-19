"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthLayout from "@/components/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");

      setSuccess(true);
      setFormData({ email: "", password: "" });

      setTimeout(() => router.push("/login"), 1000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account 🎟️"
      subtitle="Join Lotto App and start your lucky journey!"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm text-gray-200 mb-1 block">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-200 mb-1 block">Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        {success && (
          <p className="text-green-400 text-sm text-center">
            Account created! Redirecting...
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-[#0f172a] bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-transparent px-2 text-gray-300">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google")}
          className="w-full py-3 rounded-lg font-semibold text-white bg-[#ea4335] hover:bg-red-600 transition-all flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
            fill="currentColor"
          >
            <path d="M488 261.8C488 403.3 391.1 504 248.3 504c-137.4 0-248.3-111-248.3-248.3S110.9 7.5 248.3 7.5c67.1 0 123.2 24.5 166.1 64.8l-67.3 64.8C314.1 108.4 283 96 248.3 96c-84.2 0-152.2 68.4-152.2 152.5s68 152.5 152.2 152.5c72.5 0 123.6-41.4 132.1-99.5h-132v-80.7H488v38.5z" />
          </svg>
          Google
        </button>
      </form>

      <p className="text-center text-gray-300 text-sm mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-yellow-400 hover:underline">
          Log in here
        </a>
      </p>
    </AuthLayout>
  );
}
