"use client";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to the App</h1>
        <p className="text-lg">This is a simple app using Clerk for authentication.</p>
        <SignedIn>
          <div className="mt-6 flex justify-center">
            <SignOutButton>
              <button className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black transition">Sign out</button>
            </SignOutButton>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="mt-6 flex justify-center">
            <SignInButton>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">Sign in</button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
