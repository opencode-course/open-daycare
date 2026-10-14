import { connection } from "next/server";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { logoutAction } from "@/features/auth/actions";
import { requireUser, userRoleLabels } from "@/server/auth/session";

export const instant = false;

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await connection();

  const user = await requireUser();
  const sidebarProps = {
    name: user.fullName,
    initials: user.initials,
    subtitle: `${userRoleLabels[user.role]} · ${user.daycareName}`,
    logoutAction,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 lg:block">
        <Sidebar {...sidebarProps} />
      </div>
      <main className="min-w-0 flex-1 pt-16 lg:pt-0">
        <MobileNavigation>
          <Sidebar {...sidebarProps} variant="drawer" />
        </MobileNavigation>
        {children}
      </main>
    </div>
  );
}
