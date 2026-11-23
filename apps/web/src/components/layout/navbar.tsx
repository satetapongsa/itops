'use client';

import React, { useState } from 'react';
import { Bell, Search, Shield, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLayout } from '@/lib/layout-context';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useLayout();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 sticky top-0">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (responsive) */}
        <div className="relative w-44 sm:w-72 md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหา Ticket, Asset, IP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
              <div className="font-semibold text-sm text-slate-800 mb-3">การแจ้งเตือน (Notifications)</div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-900">
                  <div className="font-semibold">CRITICAL: WEB-SERVER-01 DOWN</div>
                  <div className="text-red-700 mt-0.5">ระบบสร้าง Ticket INC-2026-00001 อัตโนมัติ</div>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-900">
                  <div className="font-semibold">SLA Warning</div>
                  <div className="text-blue-700 mt-0.5">Ticket INC-2026-00003 ใกล้ครบกำหนด 75% SLA</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user ? `${user.firstName[0]}${user.lastName[0]}` : 'OP'}
          </div>
          <div className="text-xs hidden sm:block">
            <div className="font-semibold text-slate-800 truncate max-w-[120px]">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </div>
            <div className="text-blue-600 font-medium">
              {user?.role || 'ADMIN'}
            </div>
          </div>
          <Link
            href="/login"
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-50"
            title="เปลี่ยนบัญชี / เข้าสู่ระบบ"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
