'use client';

import React, { useState } from 'react';
import { BookOpen, Search, ThumbsUp, Tag } from 'lucide-react';

const mockArticles = [
  {
    id: 'kb-1',
    title: 'คู่มือการเชื่อมต่อ VPN จากภายนอกองค์กร (GlobalProtect)',
    category: 'VPN and Remote Access',
    summary: 'ขั้นตอนการติดตั้งและตั้งค่า GlobalProtect VPN สำหรับพนักงาน Work From Home',
    views: 312,
    helpful: 45,
  },
  {
    id: 'kb-2',
    title: 'วิธีแก้ไขปัญหา Outlook ไม่เชื่อมต่อ Exchange Server',
    category: 'Email Support',
    summary: 'ขั้นตอนการตรวจสอบการตั้งค่าโปรไฟล์ Outlook และการล้าง Credential Manager',
    views: 184,
    helpful: 29,
  },
  {
    id: 'kb-3',
    title: 'ขั้นตอนการขอสิทธิ์เข้าใช้งาน Network Shared Drive',
    category: 'Software Support',
    summary: 'รายละเอียดและแบบฟอร์มการขออนุมัติเข้าใช้งานโฟลเดอร์ส่วนกลางตามแผนก',
    views: 95,
    helpful: 12,
  },
];

export default function KnowledgePage() {
  const [search, setSearch] = useState('');

  const filtered = mockArticles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-slate-500 mt-1">
            คลังบทความการแก้ไขปัญหาและคู่มือการใช้งานระบบไอทีสำหรับองค์กร
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาคู่มือ, วิธีแก้ปัญหา, คีย์เวิร์ด..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((kb) => (
          <div key={kb.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                {kb.category}
              </span>
              <h3 className="font-bold text-slate-800 text-sm mt-2">{kb.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{kb.summary}</p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
              <span>เข้าชม: {kb.views} ครั้ง</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ThumbsUp className="w-3 h-3" /> {kb.helpful}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
