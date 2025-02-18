import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";
import { UploadSection } from "./upload-section";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex w-full h-full flex-col gap-4 p-4 lg:p-8">
      <UploadSection />
    </div>
  );
}
