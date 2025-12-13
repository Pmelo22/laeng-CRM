import { redirect } from "next/navigation";
import { getUserContext } from "../auth/context/userContext";
import DashboardLayoutClient from "../dashboard/layout-client";
import { resolveRedirect } from "../auth/routes/resolveRedirect";


export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

  resolveRedirect(userPermissions, (p) => p?.clientes?.view);

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
