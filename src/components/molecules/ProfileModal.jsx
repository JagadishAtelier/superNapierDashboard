import React, { useEffect, useRef, useState } from "react";
import { User, LogOut, X, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({ open, onClose }) {
  const modalRef = useRef();
  const navigate = useNavigate();
  const [canInstall, setCanInstall] = useState(false);

  // Detect Mobile only
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    setCanInstall(!!window.deferredPWA); // check if install prompt available
  }, [open]);

  const handleInstallPWA = async () => {
    const promptEvent = window.deferredPWA;

    if (!promptEvent) {
      toast.error("App install not available right now.");
      return;
    }

    promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === "accepted") {
      toast.success("App installed successfully!");
      window.deferredPWA = null;
      setCanInstall(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("You have been logged out");
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute right-12 top-24 z-50">
      <div
        ref={modalRef}
        className="bg-white w-64 rounded-lg shadow-xl border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src="/admin-img.jpg"
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">Admin Name</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        <ul className="text-sm divide-y divide-gray-100">
          <li
            className="flex items-center gap-2 py-2 px-1 cursor-pointer hover:text-blue-600"
            onClick={() => navigate("/profile")}
          >
            <User className="w-4 h-4" /> Profile
          </li>

          {/* Install App Button (Mobile Only) */}
          {isMobile && canInstall && (
            <li
              className="flex items-center gap-2 py-2 px-1 cursor-pointer text-green-600 hover:text-green-700"
              onClick={handleInstallPWA}
            >
              <Download className="w-4 h-4" />
              Install App
            </li>
          )}

          <li
            className="flex items-center gap-2 py-2 px-1 cursor-pointer text-red-500 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </li>
        </ul>
      </div>
    </div>
  );
}
