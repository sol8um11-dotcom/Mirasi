import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Spinner } from "@/components/ui";

export const metadata = {
  title: "Sign In",
  description: "Sign in to Mirasi to create your AI art portrait.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
