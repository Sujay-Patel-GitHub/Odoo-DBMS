"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { logOut } from "@/app/actions";
import { Loader } from "@/components/ui/loader";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logOut();
      if (result.error) {
        toast({
          title: "Logout Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button onClick={handleLogout} disabled={isPending} variant="outline">
      {isPending ? (
        <Loader className="mr-2 h-4 w-4" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {isPending ? "Logging out..." : "Log Out"}
    </Button>
  );
}
