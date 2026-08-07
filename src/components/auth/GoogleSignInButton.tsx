"use client";

import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  return (
    <Button
      type="button"
      onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
      className="h-11 w-full justify-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      Continue with Google
    </Button>
  );
}
