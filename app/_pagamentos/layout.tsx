import { getUserContext } from "../auth/context/userContext";
import DashboardLayoutClient from "../dashboard/layout-client";
import { resolveRedirect } from "../auth/routes/resolveRedirect";
import { redirect } from "next/navigation";


export default async function PagamentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

  if (userRole !== "admin") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayoutClient
      user={user}
      userRole={userRole}
      userPermissions={userPermissions}
    >
      {children}
    </DashboardLayoutClient>
  );
}
