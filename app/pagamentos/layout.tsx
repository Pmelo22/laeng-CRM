import { getUserContext } from "../auth/context/userContext";
import DashboardLayoutClient from "../dashboard/layout-client";
import { resolveRedirect } from "../auth/routes/resolveRedirect";


export default async function PagamentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

  //resolveRedirect(userPermissions, (p) => p?.pagamentos?.view); Adicionar permissões depois

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
