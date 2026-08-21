import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { pathname } = useLocation();
  const showHeader = pathname !== "/messages";

  return (
    <div className="flex h-screen overflow-hidden bg-surface-bg">
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {showHeader && <Header onMenuClick={() => setSidebarOpen(true)} />}
        <main
          className={
            showHeader
              ? "min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-4"
              : "min-h-0 flex-1 overflow-hidden"
          }
        >
          <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
        </main>
      </div>
    </div>
  );
}
