"use client";

import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
      className="bg-zoda-mint px-5 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-zoda-black"
    >
      Continue with Google
    </button>
  );
}
