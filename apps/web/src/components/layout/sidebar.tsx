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
  HelpCircle,
  BarChart3,
  BookOpen,
  ShieldAlert,
  ShoppingBag,
  Clock,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

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

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <ShieldAlert className="w-7 h-7 text-blue-500" />
        <div>
          <div className="font-bold text-white tracking-wide text-lg">OpsPilot</div>
          <div className="text-[11px] text-blue-400 font-medium">IT Operations Command</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div>Asia/Bangkok (UTC+7)</div>
        <div className="text-[10px] mt-1 text-slate-400">Production Mode v1.0</div>
      </div>
    </aside>
  );
}
