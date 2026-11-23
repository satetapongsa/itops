'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Download, Plus, Search, Tag, User, Laptop } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { AssetListItemDto } from '@opspilot/api-contracts';
import { AssetStatus, AssetType } from '@opspilot/shared';

const mockAssets: AssetListItemDto[] = [
  {
    id: 'ast-1',
    assetTag: 'AST-2026-0001',
    name: 'Dell Latitude 5540',
    type: AssetType.LAPTOP,
    manufacturer: 'Dell',
    model: 'Latitude 5540',
    serialNumber: 'DL5540-99881',
    hostname: 'NB-IT-01',
    status: AssetStatus.ASSIGNED,
    assignedUser: { id: 'u1', name: 'Somsak Prasert', email: 'admin@opspilot.local' },
    department: { id: 'd1', name: 'IT Infrastructure' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ast-2',
    assetTag: 'AST-2026-0002',
    name: 'Cisco Catalyst 9300 Switch',
    type: AssetType.SWITCH,
    manufacturer: 'Cisco',
    model: 'Catalyst 9300',
    serialNumber: 'CSC-9300-48P',
    hostname: 'CORE-SWITCH-01',
    status: AssetStatus.ASSIGNED,
    assignedUser: null,
    department: { id: 'd1', name: 'IT Infrastructure' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ast-3',
    assetTag: 'AST-2026-0003',
    name: 'ThinkPad T14 Gen 4',
    type: AssetType.LAPTOP,
    manufacturer: 'Lenovo',
    model: 'ThinkPad T14',
    serialNumber: 'PF-44219',
    hostname: null,
    status: AssetStatus.IN_STOCK,
    assignedUser: null,
    department: null,
    createdAt: new Date().toISOString(),
  },
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetListItemDto[]>(mockAssets);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch<AssetListItemDto[]>('/assets')
      .then((data) => {
        if (data && data.length > 0) setAssets(data);
      })
      .catch(() => {});
  }, []);

  const handleExportCsv = () => {
    window.open('http://localhost:4000/api/v1/assets/export/csv', '_blank');
  };

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
    (a.serialNumber && a.serialNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Asset Management (ITAM)</h1>
          <p className="text-sm text-slate-500 mt-1">
            ทะเบียนทรัพย์สินอุปกรณ์ไอที ฮาร์ดแวร์ ซอฟต์แวร์ และประวัติการส่งมอบ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            ส่งออก CSV (Export Inventory)
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาตาม Asset Tag, ชื่ออุปกรณ์, Serial Number..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">Asset Tag</th>
              <th className="px-6 py-3">ชื่ออุปกรณ์ (Device Name)</th>
              <th className="px-6 py-3">ประเภท</th>
              <th className="px-6 py-3">Serial Number</th>
              <th className="px-6 py-3">สถานะ (Status)</th>
              <th className="px-6 py-3">ผู้ถือครอง (Assigned To)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80 transition">
                <td className="px-6 py-4 font-semibold text-blue-600">{a.assetTag}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{a.name}</td>
                <td className="px-6 py-4 text-xs text-slate-600">{a.type}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{a.serialNumber || '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      a.status === AssetStatus.ASSIGNED
                        ? 'bg-blue-100 text-blue-700'
                        : a.status === AssetStatus.IN_STOCK
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-700">
                  {a.assignedUser ? `${a.assignedUser.name}` : <span className="text-slate-400 italic">ว่างในคลัง (In Stock)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
