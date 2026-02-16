import { Suspense } from "react";
import { CreateFlow } from "./create-flow";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Create Portrait",
  description:
    "Choose an art style and upload your photo to create an AI-powered Indian art portrait.",
};

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <CreateFlow />
    </Suspense>
  );
}
