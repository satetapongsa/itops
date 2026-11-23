'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Search, Lock } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

const mockLogs = [
  {
    id: 'aud-1',
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: 'admin@opspilot.local',
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'aud-2',
    action: 'STATUS_CHANGED',
    entityType: 'Ticket',
    entityId: 'INC-2026-00001',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    id: 'aud-3',
    action: 'CHANGE_APPROVED',
    entityType: 'ChangeRequest',
    entityId: 'CHG-2026-00001',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function AuditPage() {
  const [logs, setLogs] = useState(mockLogs);

  useEffect(() => {
    apiFetch('/audit')
      .then((data) => {
        if (data && data.length > 0) setLogs(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit & Activity Logging</h1>
          <p className="text-sm text-slate-500 mt-1">
            บันทึกประวัติการปฏิบัติงานที่ไม่อาจแก้ไขหรือลบล้างได้ (Immutable Audit Trails)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Entity Type</th>
              <th className="px-6 py-3">Target ID</th>
              <th className="px-6 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition">
                <td className="px-6 py-3 text-slate-500">
                  {new Date(log.createdAt).toLocaleString('th-TH')}
                </td>
                <td className="px-6 py-3 font-semibold text-blue-600">{log.action}</td>
                <td className="px-6 py-3 text-slate-700">{log.entityType}</td>
                <td className="px-6 py-3 text-slate-600">{log.entityId}</td>
                <td className="px-6 py-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
