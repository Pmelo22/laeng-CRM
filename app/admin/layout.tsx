import { redirect } from "next/navigation";
import { getUserContext } from "../auth/context/userContext";
import DashboardLayoutClient from "../dashboard/layout-client";


export default async function ClienteLayout({
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
