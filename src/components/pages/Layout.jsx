import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import clipboardService from "@/utils/clipboard";
import ApperIcon from "@/components/ApperIcon";
import Sidebar from "@/components/organisms/Sidebar";

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Demo function to test clipboard functionality
  const handleSharePage = async () => {
    try {
      const result = await clipboardService.copyCurrentUrl({
        showToast: true,
        toastPosition: 'top-right'
      });
      
      if (!result.success) {
        console.error('Failed to copy URL:', result.error);
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share page', { position: 'top-right' });
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          <ApperIcon name="Menu" size={20} />
        </button>
      </div>

      {/* Share button for testing clipboard functionality */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={handleSharePage}
          className="p-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition-colors"
          title="Share current page"
        >
          <ApperIcon name="Share" size={20} />
        </button>
      </div>

<div className="flex">
        {/* Sidebar */}
        <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-64">
          <div className="max-w-4xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;