import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface AuthCardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  headerDescription: string;
  backButtonLabel: string;
  backButtonHref: string;
}

export const AuthCardWrapper = ({
  children,
  headerLabel,
  headerDescription,
  backButtonLabel,
  backButtonHref,
}: AuthCardWrapperProps) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Odoo_logo_rgb.svg/800px-Odoo_logo_rgb.svg.png?20151230141100"
              alt="Odoo Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
          <CardTitle>{headerLabel}</CardTitle>
          <CardDescription>{headerDescription}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {backButtonLabel && backButtonHref && (
          <CardFooter>
            <Link
              href={backButtonHref}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {backButtonLabel}
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
