'use client';

import React, { useState } from 'react';
import { Bell, Search, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหา Ticket, Asset, IP, หรือ Server..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
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
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-800">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </div>
            <div className="text-blue-600 font-medium">
              {user?.role || 'EMPLOYEE'}
            </div>
          </div>
          <Link
            href="/login"
            className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-1"
            title="เปลี่ยนบัญชี / เข้าสู่ระบบ"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
