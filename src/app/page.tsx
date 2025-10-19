"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {session ? (
        <>
          <p className="text-lg mb-4">Signed in as {session.user?.email}</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
