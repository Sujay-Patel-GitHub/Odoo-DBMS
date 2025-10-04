
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "@/app/actions";
import { SignInSchema } from "@/lib/schemas";
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { Loader } from "@/components/ui/loader";
import { Mail, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof SignInSchema>) => {
    startTransition(async () => {
      const result = await signIn(values);
      if (result.error) {
        toast({
          title: "Sign In Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully! Redirecting...",
        });
        
        if (result.role === "Manager") {
          router.push("/manager");
        } else if (result.role === "Employee") {
          router.push("/employee");
        } else if (result.role === "Admin") {
          router.push("/dashboard");
        } else {
           router.push("/dashboard");
        }
      }
    });
  };

  return (
    <AuthCardWrapper
      headerLabel="Welcome Back"
      headerDescription="Sign in to continue to your account"
      backButtonLabel="Don't have an account? Sign up"
      backButtonHref="/signup"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder=""
                      type="email"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder=""
                      type="password"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
                <Button
                  size="sm"
                  variant="link"
                  asChild
                  className="px-0 font-normal"
                >
                  <Link href="/forgot-password">Forgot password?</Link>
                </Button>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isPending ? <Loader className="h-4 w-4"/> : "Sign In"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
}

    

    