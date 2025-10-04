"use client";

import { useAuth } from "@/lib/firebase/auth";
import { Loader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);


  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader />
    </div>
  );
}
