'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Search, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

const mockProblems = [
  {
    id: 'prb-1',
    problemNumber: 'PRB-2026-00001',
    title: 'Recurring Fiber SFP Flapping on Core Switch 01',
    status: 'RESOLVED',
    rootCause: 'Ambient rack air temperature reached 38C due to blocked intake filters',
    correctiveAction: 'Rerouted cooling airflow and replaced fan filter elements',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prb-2',
    problemNumber: 'PRB-2026-00002',
    title: 'Memory Leak in Node API Gateway during peak hours',
    status: 'INVESTIGATING',
    rootCause: 'Unclosed SSE subscriptions under high client reconnect load',
    correctiveAction: 'Investigating RxJS subject disposal hooks',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState(mockProblems);

  useEffect(() => {
    apiFetch('/problems')
      .then((data) => {
        if (data && data.length > 0) setProblems(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Problem Management & RCA</h1>
          <p className="text-sm text-slate-500 mt-1">
            การวิเคราะห์หาสาเหตุที่แท้จริงเพื่อป้องกันปัญหาซ้ำซ้อน (Root Cause Analysis & Known Errors)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {problems.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-600 text-sm">{p.problemNumber}</span>
                <h3 className="font-bold text-slate-800 text-base">{p.title}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {p.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="font-bold text-slate-500 uppercase">สาเหตุที่แท้จริง (Root Cause):</span>
                <div className="text-slate-800 mt-1">{p.rootCause || 'กำลังดำเนินการวิเคราะห์...'}</div>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase">มาตรการแก้ไขและป้องกัน (Corrective Action):</span>
                <div className="text-slate-800 mt-1">{p.correctiveAction || 'กำลังกำหนดแนวทาง...'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
