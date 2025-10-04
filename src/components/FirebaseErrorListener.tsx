'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: any) => {
      // In a real app, you might want to log this to a service like Sentry
      // For now, we'll just show a toast
      console.error("Caught a permission error:", error);

      toast({
        variant: "destructive",
        title: "Permission Error",
        description: "You don't have permission to perform this action.",
      });

      // Throwing the error here will make it show up in the Next.js dev overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
