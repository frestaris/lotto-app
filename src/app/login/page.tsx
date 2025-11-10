"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import Spinner from "@/components/Spinner";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  // ✅ Show spinner while loading session
  if (status === "loading") {
    return <Spinner variant="accent" size="lg" fullScreen />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Sign in to continue your lucky journey!"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="text-sm text-gray-200 mb-1 block">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full p-1 sm:p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-200 mb-1 block">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-1 sm:p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-300 text-sm text-center">{error}</p>}

        {/* Sign In button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:py-3 py-1 rounded-lg font-semibold text-[#0f172a] bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition-all disabled:opacity-50 hover:cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" /> Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center ">
          <span className="flex items-center w-full max-w-xs">
            <span className="flex-grow border-t border-white/20"></span>
            <span className="mx-3 text-gray-300 text-sm whitespace-nowrap">
              Or continue with
            </span>
            <span className="flex-grow border-t border-white/20"></span>
          </span>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full sm:py-3 py-1 rounded-lg font-semibold text-white bg-[#ea4335] hover:bg-red-600 transition-all flex items-center justify-center gap-2 hover:cursor-pointer"
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
        Don’t have an account?{" "}
        <a href="/register" className="text-yellow-400 hover:underline">
          Register here
        </a>
      </p>
    </AuthLayout>
  );
}
