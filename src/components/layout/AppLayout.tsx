import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-20 md:pb-6">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
}
