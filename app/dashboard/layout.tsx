import { getUserContext } from "../auth/context/userContext";
import DashboardLayoutClient from "../dashboard/layout-client";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

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
