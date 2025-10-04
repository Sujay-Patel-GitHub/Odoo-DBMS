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
import { sendPasswordReset } from "@/app/actions";
import { ForgotPasswordSchema } from "@/lib/schemas";
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { Loader } from "@/components/ui/loader";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
    startTransition(async () => {
      const result = await sendPasswordReset(values);
       if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
         toast({
          title: "Success",
          description: result.success
        });
      }
    });
  };

  return (
    <AuthCardWrapper
      headerLabel="Forgot Your Password?"
      headerDescription="No worries, we'll send you reset instructions."
      backButtonLabel=""
      backButtonHref=""
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
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isPending ? <Loader className="h-4 w-4"/> : "Send Reset Link"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
}
