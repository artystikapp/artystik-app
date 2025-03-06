"use client";

import { useAuth, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  // Hide navbar on auth pages
  if (
    pathname === process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
    pathname === process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL
  ) {
    return null;
  }

  // Show loading state
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Create redirect URL (current path)
  const redirectUrl =
    pathname === process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
    pathname === process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL
      ? "/" // If we're on auth pages, redirect to home
      : pathname; // Otherwise redirect back to current page

  return (
    <nav className="p-4 flex justify-between items-center border-b">
      <Link href="/" className="font-bold text-xl">
        Artystik
      </Link>

      <div className="flex items-center gap-4">
        {!isSignedIn ? (
          <Link
            href={`${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}?redirect_url=${redirectUrl}`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Log In
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <SignOutButton />
          </div>
        )}
      </div>
    </nav>
  );
}
