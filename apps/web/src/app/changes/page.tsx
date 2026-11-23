'use client';

import React, { useState, useEffect } from 'react';
import { GitPullRequest, Plus, Shield, Check, X, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { ChangeListItemDto } from '@opspilot/api-contracts';
import { ChangeCategory, ChangeRiskLevel, ChangeStatus } from '@opspilot/shared';

const mockChanges: ChangeListItemDto[] = [
  {
    id: 'chg-1',
    changeNumber: 'CHG-2026-00001',
    title: 'Core Switch Firmware Upgrade v17.9',
    category: ChangeCategory.NETWORK,
    riskLevel: ChangeRiskLevel.HIGH,
    status: ChangeStatus.PENDING_APPROVAL,
    requestedBy: { id: 'u1', name: 'Nattapong S.' },
    plannedStart: '2026-11-25T23:00:00Z',
    plannedEnd: '2026-11-26T02:00:00Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'chg-2',
    changeNumber: 'CHG-2026-00002',
    title: 'PostgreSQL Connection Pool Adjustment',
    category: ChangeCategory.DATABASE,
    riskLevel: ChangeRiskLevel.MEDIUM,
    status: ChangeStatus.COMPLETED,
    requestedBy: { id: 'u2', name: 'Somsak P.' },
    plannedStart: '2026-11-20T20:00:00Z',
    plannedEnd: '2026-11-20T21:00:00Z',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function ChangesPage() {
  const [changes, setChanges] = useState<ChangeListItemDto[]>(mockChanges);

  useEffect(() => {
    apiFetch<ChangeListItemDto[]>('/changes')
      .then((data) => {
        if (data && data.length > 0) setChanges(data);
      })
      .catch(() => {});
  }, []);

  const handleApprove = async (id: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: ChangeStatus.SCHEDULED } : c))
    );
    apiFetch(`/changes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes: 'Approved by IT Manager via Command Center' }),
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Change Management (CAB)</h1>
          <p className="text-sm text-slate-500 mt-1">
            การควบคุมและอนุมัติการเปลี่ยนแปลงโครงสร้างพื้นฐานไอที (ITIL Change Enablement)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">เลขที่ Change</th>
              <th className="px-6 py-3">ชื่องานเปลี่ยนแปลง (Title)</th>
              <th className="px-6 py-3">ระดับความเสี่ยง (Risk)</th>
              <th className="px-6 py-3">สถานะ (Status)</th>
              <th className="px-6 py-3">ผู้เสนอขอ</th>
              <th className="px-6 py-3 text-right">การอนุมัติ (Approval)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {changes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition">
                <td className="px-6 py-4 font-semibold text-blue-600">{c.changeNumber}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{c.title}</div>
                  <div className="text-xs text-slate-400">{c.category}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      c.riskLevel === ChangeRiskLevel.HIGH
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {c.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.status === ChangeStatus.PENDING_APPROVAL
                        ? 'bg-amber-100 text-amber-800'
                        : c.status === ChangeStatus.SCHEDULED
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">{c.requestedBy.name}</td>
                <td className="px-6 py-4 text-right">
                  {c.status === ChangeStatus.PENDING_APPROVAL ? (
                    <button
                      onClick={() => handleApprove(c.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow transition"
                    >
                      อนุมัติ (Approve)
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">เรียบร้อยแล้ว</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
