import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>
      <main className="min-w-0 flex-1 pt-16 lg:pt-0">
        <MobileNavigation>
          <Sidebar variant="drawer" />
        </MobileNavigation>
        {children}
      </main>
    </div>
  );
}
