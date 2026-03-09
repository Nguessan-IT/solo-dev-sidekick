import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import PageTransition from "./PageTransition";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-20 md:pb-6">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <MobileBottomNav />
    </div>
  );
}
