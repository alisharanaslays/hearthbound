import { redirect } from "next/navigation";
import { DeskNav } from "@/components/admin/DeskNav";
import { adminReady, isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!adminReady() || !(await isAdmin())) redirect("/admin/login");
  return (
    <div className="wrap page">
      <p className="eyebrow">Site desk</p>
      <DeskNav />
      {children}
    </div>
  );
}
