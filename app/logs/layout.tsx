import { redirect } from "next/navigation";
import { getUserContext } from "../auth/context/userContext";
import DashboardLayoutClient from "../dashboard/layout-client";
import { resolveRedirect } from "../auth/routes/resolveRedirect";


export default async function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

  resolveRedirect(userPermissions, (p) => p?.logs?.view);

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
