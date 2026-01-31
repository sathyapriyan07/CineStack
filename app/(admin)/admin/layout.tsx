
import DashboardLayout from "@/components/ui/dashboard-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, profile } = await getSessionAndProfile();
  if (!session) redirect("/admin-login");
  if (!profile || profile.role !== "admin") redirect("/");
  return <DashboardLayout>{children}</DashboardLayout>;
}

