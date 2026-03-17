import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import image from "../../assets/ik-white.svg";
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart2,
  Star,
  LucideShoppingCart,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

export default function Sidebar({ setSidebarOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = () => {
    if (window.innerWidth < 640 && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const isProductActive =
    location.pathname.startsWith("/products") &&
    !location.pathname.includes("/marketing");

  return (
    <aside
      className={`${collapsed ? "sm:w-20" : "sm:w-56"
        } w-80 bg-[#0a2613] text-white h-full p-6 pe-0 transition-[width] duration-300 ease-in-out relative select-none`}
    >
      {/* Logo */}
      <div
        className={`mb-10 px-1 flex items-center gap-2 ${collapsed ? "justify-center" : "px-5"
          }`}
      >
        <a
          href="/"
          className="text-2xl font-bold transition-all duration-300 ease-in-out select-text"
        >
          <img
            src={collapsed ? "/col-logo.png" : "/logo.png"}
            className={`${collapsed
                ? "w-10 h-10 object-contain filter brightness-0 invert"
                : "w-full h-auto filter brightness-0 invert"
              }`}
            alt="Logo"
          />
        </a>
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute bottom-14 -right-3 transition-all duration-300 ease-in-out hidden sm:block bg-[#fdc700] text-[#0a2613] p-1 rounded-full shadow-md"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-4">
        {/* Dashboard */}
        <NavLink
          to="/"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-2 ${collapsed ? "justify-center" : "ps-3 pe-5"
            } py-3 rounded-[13px] rounded-tr-[0px] rounded-br-[0px] transition relative ${isActive
              ? "text-[#0a2613] font-medium active-tab active-tab-bg"
              : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
            }`
          }
          title={collapsed ? "Dashboard" : undefined}
        >
          <LayoutDashboard />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Products with submenu */}
        <div>
          <button
            onClick={() => setProductOpen(!productOpen)}
            className={`w-full flex items-center gap-2 ${collapsed ? "justify-center" : "ps-3 pe-5"
              } py-3 rounded-[13px] rounded-tr-[0px] rounded-br-[0px] transition ${(isProductActive || productOpen) && !collapsed
                ? "text-[#0a2613] font-medium bg-[#fafcf8]"
                : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
              }`}
          >
            <BarChart2 />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Products</span>
                {productOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </>
            )}
          </button>

          {!collapsed && productOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <NavLink
                to="/products"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `block text-sm rounded rounded-r-none px-2 py-2 transition ${isActive
                    ? "text-[#0a2613] font-medium bg-white active-tab active-tab-bg"
                    : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
                  }`
                }
              >
                All Products
              </NavLink>
              <NavLink
                to="/addproducts"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `block text-sm rounded rounded-r-none px-2 py-2 transition ${isActive
                    ? "text-[#0a2613] font-medium bg-white active-tab active-tab-bg"
                    : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
                  }`
                }
              >
                Add Product
              </NavLink>
              <NavLink
                to="/categories"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `block text-sm rounded rounded-r-none px-2 py-2 transition ${isActive
                    ? "text-[#0a2613] font-medium bg-white active-tab"
                    : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
                  }`
                }
              >
                Categories
              </NavLink>
            </div>
          )}
        </div>

        {/* Orders */}
        <NavLink
          to="/orders"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-2 ${collapsed ? "justify-center" : "ps-3 pe-5"
            } py-3 rounded-[13px] rounded-tr-[0px] rounded-br-[0px] transition relative ${isActive
              ? "text-[#0a2613] font-medium active-tab active-tab-bg"
              : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
            }`
          }
          title={collapsed ? "Orders" : undefined}
        >
          <ShoppingBag />
          {!collapsed && <span>Orders</span>}
        </NavLink>

        {/* Payments */}
        <NavLink
          to="/payments"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-2 ${collapsed ? "justify-center" : "ps-3 pe-5"
            } py-3 rounded-[13px] rounded-tr-[0px] rounded-r-[0px] transition relative ${isActive
              ? "text-[#0a2613] font-medium active-tab active-tab-bg"
              : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
            }`
          }
          title={collapsed ? "Payments" : undefined}
        >
          <IndianRupee />
          {!collapsed && <span>Payments</span>}
        </NavLink>
        {/* Blog */}
        <NavLink
          to="/Blogs"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-2 ${collapsed ? "justify-center" : "ps-3 pe-5"
            } py-3 rounded-[13px] rounded-tr-[0px] rounded-r-[0px] transition relative ${isActive
              ? "text-[#0a2613] font-medium active-tab active-tab-bg"
              : "hover:bg-[#fafcf8] hover:text-[#0a2613]"
            }`
          }
          title={collapsed ? "Blogs" : undefined}
        >
          <FileText />
          {!collapsed && <span>Blogs</span>}
        </NavLink>

        {/* Marketing */}
        {/* <NavLink
          to="/marketing"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-2 ${
              collapsed ? 'justify-center' : 'ps-3 pe-5'
            } py-3 rounded-[13px] rounded-tr-[0px] rounded-br-[0px] transition relative ${
              isActive ? 'text-[#5840BB] font-medium active-tab active-tab-bg' : 'hover:bg-purple-700'
            }`
          }
          title={collapsed ? 'Marketing' : undefined}
        >
          <Star />
          {!collapsed && <span>Marketing</span>}
        </NavLink> */}
      </nav>
    </aside>
  );
}
