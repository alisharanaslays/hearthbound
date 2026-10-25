import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { PageHeader } from "@/components/PageHeader";
import { adminReady, isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Site desk" };

export default async function Page() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="wrap page">
      <PageHeader
        eyebrow="Site desk"
        title="Open the desk"
        lede="Change the words, colors, book list, and shelf notes. Visitor shelves, drawings, and coloring stay in their own browser and are not edited here."
      />
      {adminReady() ? (
        <LoginForm />
      ) : (
        <div className="card desk-card">
          <p>The desk is locked until this server has a secret.</p>
          <p>Add <code>ADMIN_SECRET</code> to <code>.env.local</code> with at least 8 characters, then restart the server. The example file is <code>.env.example</code>.</p>
        </div>
      )}
    </div>
  );
}
