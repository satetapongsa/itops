'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Server,
  Layers,
  GitPullRequest,
  BarChart3,
  BookOpen,
  ShieldAlert,
  ShoppingBag,
  Clock,
  ShieldCheck,
  FileCheck,
  X,
} from 'lucide-react';
import { useLayout } from '@/lib/layout-context';

const navigationGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'SERVICE MANAGEMENT',
    items: [
      { name: 'Incident Management', href: '/incidents', icon: AlertTriangle },
      { name: 'Service Catalog', href: '/service-catalog', icon: ShoppingBag },
      { name: 'SLA Engine', href: '/sla', icon: Clock },
    ],
  },
  {
    title: 'INFRASTRUCTURE',
    items: [
      { name: 'Monitoring Center', href: '/monitoring', icon: Server },
      { name: 'IT Asset Inventory', href: '/assets', icon: Layers },
    ],
  },
  {
    title: 'IT OPERATIONS',
    items: [
      { name: 'Change Management', href: '/changes', icon: GitPullRequest },
      { name: 'Problem Management', href: '/problems', icon: ShieldCheck },
      { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
    ],
  },
  {
    title: 'ANALYTICS & AUDIT',
    items: [
      { name: 'Reports & MTTR', href: '/reports', icon: BarChart3 },
      { name: 'Audit Logs', href: '/audit', icon: FileCheck },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useLayout();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-navy-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-blue-500 shrink-0" />
            <div>
              <div className="font-bold text-white tracking-wide text-lg leading-tight">OpsPilot</div>
              <div className="text-[11px] text-blue-400 font-medium">IT Operations Command</div>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 shrink-0">
          <div>Asia/Bangkok (UTC+7)</div>
          <div className="text-[10px] mt-1 text-slate-400">Production Mode v1.0</div>
        </div>
      </aside>
    </>
  );
}
