import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/organisms/Sidebar";
import Header from "../components/organisms/Header";
import { Menu, X } from "lucide-react";


export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a2613]">
      {/* Sidebar */}
<div
  className={`fixed lg:static z-40 top-16 left-0 h-full transition-transform duration-300 ease-in-out
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0`}
>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col rounded-none lg:rounded-[40px] bg-[#fafcf8] lg:my-3 lg:me-3 w-full">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto rounded-none md:rounded-[40px] md:p-3 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
