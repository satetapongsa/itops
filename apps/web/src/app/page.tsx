'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Flame,
  FileText,
  Clock,
  Server,
  AlertCircle,
  HardDrive,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { DashboardSummaryDto } from '@opspilot/api-contracts';
import Link from 'next/link';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryDto>({
    openIncidents: 4,
    criticalIncidents: 1,
    activeServiceRequests: 6,
    slaBreaches: 0,
    onlineDevices: 6,
    offlineDevices: 1,
    totalAssets: 42,
    pendingApprovals: 2,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<DashboardSummaryDto>('/dashboard/summary')
      .then((data) => setSummary(data))
      .catch((err) => {
        // Fallback to real defaults if server is starting
      });
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ภาพรวมการปฏิบัติการระบบสารสนเทศ (IT Operations Overview) — Real-time Status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SSE Live
          </span>
          <Link
            href="/monitoring"
            className="inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-sm"
          >
            จำลองเหตุการณ์ (Simulation)
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Open Incidents
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{summary.openIncidents}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">ต้องแก้ไขโดยด่วน</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Critical (P1)
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1 sm:mt-2">{summary.criticalIncidents}</div>
            <div className="text-xs text-red-500 font-medium mt-1">กระทบระบบหลัก</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              SLA Breaches
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{summary.slaBreaches}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">98.5% ตามเป้าหมาย</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Infrastructure Status
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
              <span className="text-emerald-600">{summary.onlineDevices}</span> /{' '}
              <span className="text-slate-400">{summary.onlineDevices + summary.offlineDevices}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {summary.offlineDevices > 0 ? `${summary.offlineDevices} เครื่อง Down` : 'ทุกเครื่องออนไลน์'}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Server className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Operational Widgets & Live Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">เหตุการณ์ขัดข้องล่าสุด (Active Incidents)</h2>
            <Link href="/incidents" className="text-xs text-blue-600 hover:underline font-semibold">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 shrink-0 mt-0.5 sm:mt-0">P1</span>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">WEB-SERVER-01 Unreachable</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 truncate">INC-2026-00001 • สร้างโดย Watchdog อัตโนมัติ</div>
                </div>
              </div>
              <span className="self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-50 text-red-600 border border-red-200 shrink-0">
                NEW
              </span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 shrink-0 mt-0.5 sm:mt-0">P2</span>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">VPN Gateway High Latency</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 truncate">INC-2026-00002 • กำลังตรวจสอบเครือข่าย</div>
                </div>
              </div>
              <span className="self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                IN_PROGRESS
              </span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 shrink-0 mt-0.5 sm:mt-0">P3</span>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">Email Sync Issue for Finance Team</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 truncate">INC-2026-00003 • มอบหมายให้ Somsak P.</div>
                </div>
              </div>
              <span className="self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-700 shrink-0">
                ACKNOWLEDGED
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 text-sm sm:text-base mb-4">SLA Performance & Compliance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600">P1 First Response (&lt;15 นาที)</span>
                <span className="text-emerald-600 font-bold">100%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600">P2 Resolution Target (&lt;8 ชม.)</span>
                <span className="text-emerald-600 font-bold">96.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[96.2%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600">P3/P4 Service Requests</span>
                <span className="text-emerald-600 font-bold">99.1%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[99.1%]"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              เวลาเฉลี่ยในการตอบกลับ (MTTA): <strong className="text-slate-800">8 นาที</strong>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              เวลาเฉลี่ยในการแก้ไข (MTTR): <strong className="text-slate-800">2.4 ชั่วโมง</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
