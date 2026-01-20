import { getUserContext } from "@/app/auth/context/userContext";
import DashboardLayoutClient from "@/app/dashboard/layout-client";
import { redirect } from "next/navigation";


export default async function ReceitaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userRole, userPermissions } = await getUserContext();

    if (userRole !== "admin") {
        // Assuming same restrictions as previous Pagamentos
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
