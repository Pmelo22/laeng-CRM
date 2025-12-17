import { redirect } from "next/navigation";
import { getUserContext } from "../auth/context/userContext";
import DashboardLayoutClient from "../dashboard/layout-client";
import { resolveRedirect } from "../auth/routes/resolveRedirect";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

  resolveRedirect(userPermissions, (p) => p?.dashboard?.view);

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
