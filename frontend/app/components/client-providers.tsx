"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr:false must be inside a Client Component
// layout.tsx is a Server Component so this wrapper is needed
const Providers = dynamic(
  () => import("./providers").then((m) => m.Providers),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
