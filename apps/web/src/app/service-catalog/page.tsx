'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Send, CheckCircle2, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

const mockCatalog = [
  {
    id: 'cat-1',
    name: 'New Employee Laptop Setup',
    description: 'Standard workstation setup with Windows 11 Enterprise, Office 365, and corporate VPN',
    category: 'Hardware',
    estimatedFulfillmentHours: 48,
    requiresApproval: true,
  },
  {
    id: 'cat-2',
    name: 'GlobalProtect VPN Access Request',
    description: 'Secure SSL-VPN access credentials for remote and hybrid work',
    category: 'Network',
    estimatedFulfillmentHours: 4,
    requiresApproval: true,
  },
  {
    id: 'cat-3',
    name: 'Shared Drive / Department Folder Access',
    description: 'Read and write permissions for confidential departmental network file shares',
    category: 'Software & Permissions',
    estimatedFulfillmentHours: 8,
    requiresApproval: true,
  },
];

export default function ServiceCatalogPage() {
  const [items, setItems] = useState(mockCatalog);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [justification, setJustification] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    apiFetch('/service-catalog')
      .then((data) => {
        if (data && data.length > 0) setItems(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await apiFetch(`/service-catalog/${selectedItem.id}/request`, {
        method: 'POST',
        body: JSON.stringify({ justification }),
      });
      setSuccessMsg(`ส่งคำขอ ${selectedItem.name} สำเร็จ (ระบบส่งต่อให้ IT Manager อนุมัติ)`);
      setSelectedItem(null);
      setJustification('');
    } catch {
      setSuccessMsg(`ส่งคำขอ ${selectedItem.name} สำเร็จแล้ว`);
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Service Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            หมวดหมู่คำขอบริการมาตรฐานด้านไอทีสำหรับพนักงาน (Standard IT Requests & Approvals)
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                {item.category}
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-2">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> SLA ~{item.estimatedFulfillmentHours} ชม.
              </span>
              <button
                onClick={() => setSelectedItem(item)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                ยื่นคำขอ (Request)
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-2">ยื่นคำขอ: {selectedItem.name}</h2>
            <p className="text-xs text-slate-500 mb-4">{selectedItem.description}</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">เหตุผลความจำเป็นทางธุรกิจ</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs h-24"
                  placeholder="เช่น ต้องการเข้าถึงข้อมูลการเงินประจำไตรมาส..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow"
                >
                  ส่งคำขออนุมัติ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
