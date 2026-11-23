'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

const mockPolicies = [
  { priority: 'P1', name: 'Critical Outage', firstResponse: '15 นาที', resolution: '4 ชั่วโมง', target: '99.5%' },
  { priority: 'P2', name: 'High Degradation', firstResponse: '1 ชั่วโมง', resolution: '8 ชั่วโมง', target: '98.0%' },
  { priority: 'P3', name: 'Medium Standard', firstResponse: '4 ชั่วโมงทำการ', resolution: '3 วันทำการ', target: '95.0%' },
  { priority: 'P4', name: 'Low Request', firstResponse: '1 วันทำการ', resolution: '5 วันทำการ', target: '90.0%' },
];

export default function SlaPage() {
  const [policies, setPolicies] = useState(mockPolicies);

  useEffect(() => {
    apiFetch('/sla/policies')
      .then((data) => {
        if (data && data.length > 0) {
          // map if available
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SLA Management Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            นโยบายและข้อตกลงระดับการให้บริการ (Service Level Agreement Policies & Clocks)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">ระดับความสำคัญ</th>
              <th className="px-6 py-3">นโยบาย (Policy Name)</th>
              <th className="px-6 py-3">First Response Target</th>
              <th className="px-6 py-3">Resolution Target</th>
              <th className="px-6 py-3">เป้าหมายความสำเร็จ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {policies.map((p) => (
              <tr key={p.priority} className="hover:bg-slate-50/80 transition">
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.priority === 'P1' ? 'bg-red-100 text-red-700' : p.priority === 'P2' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.priority}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-xs text-slate-600">{p.firstResponse}</td>
                <td className="px-6 py-4 text-xs text-slate-600">{p.resolution}</td>
                <td className="px-6 py-4 text-xs font-bold text-emerald-600">{p.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
