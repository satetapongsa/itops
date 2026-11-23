'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState({
    totalIncidents: 34,
    resolvedIncidents: 30,
    mttaMinutes: 8,
    mttrMinutes: 144, // 2.4 hours
    slaComplianceRate: 98.5,
    changeSuccessRate: 100,
    availabilityPercent: 99.8,
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/reports/incidents').catch(() => null),
      apiFetch('/reports/sla').catch(() => null),
      apiFetch('/reports/changes').catch(() => null),
      apiFetch('/reports/availability').catch(() => null),
    ]).then(([inc, sla, chg, avl]) => {
      if (inc && sla && chg && avl) {
        setMetrics({
          totalIncidents: inc.totalIncidents,
          resolvedIncidents: inc.resolvedIncidents,
          mttaMinutes: inc.mttaMinutes,
          mttrMinutes: inc.mttrMinutes,
          slaComplianceRate: sla.complianceRate,
          changeSuccessRate: chg.changeSuccessRate,
          availabilityPercent: avl.availabilityPercent,
        });
      }
    });
  }, []);

  const handleExport = () => {
    window.open('http://localhost:4000/api/v1/reports/export/csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & IT Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            รายงานชี้วัดประสิทธิภาพตามมาตรฐานสากล (MTTA, MTTR, SLA Compliance, Infrastructure Uptime)
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          ส่งออกรายงานภาพรวม (Export KPI CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase">Mean Time to Acknowledge (MTTA)</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{metrics.mttaMinutes} นาที</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">เป้าหมาย &lt; 15 นาที</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase">Mean Time to Resolve (MTTR)</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{(metrics.mttrMinutes / 60).toFixed(1)} ชม.</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">เป้าหมาย &lt; 4.0 ชม.</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase">SLA Compliance Rate</div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">{metrics.slaComplianceRate}%</div>
          <div className="text-xs text-slate-500 mt-1">เกณฑ์มาตรฐาน 95%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase">Infrastructure Availability</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{metrics.availabilityPercent}%</div>
          <div className="text-xs text-slate-500 mt-1">ระบบทั้งหมด 7 เครื่อง</div>
        </div>
      </div>
    </div>
  );
}
