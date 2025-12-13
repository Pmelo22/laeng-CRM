import { redirect } from "next/navigation";
import { ROUTES } from "./routes";

export function resolveRedirect(
  userPermissions: any,
  currentPermissionCheck: (p: any) => boolean
) {

  if (currentPermissionCheck(userPermissions)) {
    return;
  }

  const nextRoute = ROUTES.find(route =>
    route.permission(userPermissions)
  );

  if (nextRoute) {
    redirect(nextRoute.path);
  }

  redirect("/error");
}
