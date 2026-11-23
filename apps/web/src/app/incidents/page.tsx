'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { TicketListItemDto } from '@opspilot/api-contracts';
import { TicketPriority, TicketStatus, ImpactLevel, UrgencyLevel, calculatePriority } from '@opspilot/shared';

export default function IncidentsPage() {
  const [tickets, setTickets] = useState<TicketListItemDto[]>([
    {
      id: 'inc-1',
      ticketNumber: 'INC-2026-00001',
      type: 'INCIDENT' as any,
      title: 'WEB-SERVER-01 Unreachable',
      description: 'Host monitoring triggered critical heartbeat failure',
      category: 'Server',
      priority: TicketPriority.P1,
      impact: ImpactLevel.HIGH,
      urgency: UrgencyLevel.HIGH,
      status: TicketStatus.NEW,
      requester: { id: 'u1', name: 'Monitoring Watchdog', email: 'system@opspilot.local' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-2',
      ticketNumber: 'INC-2026-00002',
      type: 'INCIDENT' as any,
      title: 'VPN Gateway High Latency',
      description: 'Employees reporting dropped sessions across Bangkok office',
      category: 'Network',
      priority: TicketPriority.P2,
      impact: ImpactLevel.HIGH,
      urgency: UrgencyLevel.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      requester: { id: 'u2', name: 'Apinya K.', email: 'apinya@opspilot.local' },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketListItemDto | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Server');
  const [impact, setImpact] = useState<ImpactLevel>(ImpactLevel.MEDIUM);
  const [urgency, setUrgency] = useState<UrgencyLevel>(UrgencyLevel.MEDIUM);

  useEffect(() => {
    apiFetch<TicketListItemDto[]>('/tickets?type=INCIDENT')
      .then((data) => {
        if (data && data.length > 0) setTickets(data);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedPriority = calculatePriority(impact, urgency);

    const newTicket: TicketListItemDto = {
      id: `inc-${Date.now()}`,
      ticketNumber: `INC-2026-${String(tickets.length + 1).padStart(5, '0')}`,
      type: 'INCIDENT' as any,
      title,
      description,
      category,
      impact,
      urgency,
      priority: calculatedPriority,
      status: TicketStatus.NEW,
      requester: { id: 'curr', name: 'Somsak P.', email: 'admin@opspilot.local' },
      createdAt: new Date().toISOString(),
    };

    setTickets([newTicket, ...tickets]);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');

    // Attempt real API post
    apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        type: 'INCIDENT',
        title,
        description,
        category,
        impact,
        urgency,
      }),
    }).catch(() => {});
  };

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }

    apiFetch(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incident Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            การจัดการเหตุการณ์ขัดข้องของระบบสารสนเทศตามมาตรฐาน ITIL & SLA
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          แจ้งเหตุการณ์ขัดข้อง (New Incident)
        </button>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">เลขที่ Ticket</th>
                <th className="px-6 py-3">หัวข้อปัญหา (Title)</th>
                <th className="px-6 py-3">ความสำคัญ (Priority)</th>
                <th className="px-6 py-3">สถานะ (Status)</th>
                <th className="px-6 py-3">ผู้แจ้ง (Requester)</th>
                <th className="px-6 py-3">เวลาสร้าง</th>
                <th className="px-6 py-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition cursor-pointer">
                  <td className="px-6 py-4 font-semibold text-blue-600">{t.ticketNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{t.title}</div>
                    <div className="text-xs text-slate-400">{t.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        t.priority === TicketPriority.P1
                          ? 'bg-red-100 text-red-700'
                          : t.priority === TicketPriority.P2
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        t.status === TicketStatus.NEW
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : t.status === TicketStatus.IN_PROGRESS
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : t.status === TicketStatus.RESOLVED
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{t.requester.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(t.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      รายละเอียด →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">แจ้งเหตุการณ์ขัดข้องใหม่ (New Incident)</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">หัวข้อปัญหา</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น ไม่สามารถเข้าใช้งานระบบ Database ได้"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">หมวดหมู่</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Server">Server</option>
                  <option value="Network">Network</option>
                  <option value="Database">Database</option>
                  <option value="Software">Software</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">ผลกระทบ (Impact)</label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value as ImpactLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value={ImpactLevel.HIGH}>HIGH (ทั้งองค์กร)</option>
                    <option value={ImpactLevel.MEDIUM}>MEDIUM (แผนก)</option>
                    <option value={ImpactLevel.LOW}>LOW (รายบุคคล)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">ความเร่งด่วน (Urgency)</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value={UrgencyLevel.HIGH}>HIGH (ระบบหยุดชะงัก)</option>
                    <option value={UrgencyLevel.MEDIUM}>MEDIUM (ช้าลง)</option>
                    <option value={UrgencyLevel.LOW}>LOW (ยังทำงานได้)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                ระดับความสำคัญที่คำนวณได้อัตโนมัติ: <strong>{calculatePriority(impact, urgency)}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">รายละเอียดปัญหา</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24"
                  placeholder="ระบุข้อความ error หรือพฤติกรรมที่ผิดปกติ..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow"
                >
                  สร้าง Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 p-6 z-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-blue-600">{selectedTicket.ticketNumber}</span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedTicket.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedTicket.description}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">สถานะปัจจุบัน:</span>
                  <span className="font-bold text-slate-800">{selectedTicket.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">ระดับ Priority:</span>
                  <span className="font-bold text-red-600">{selectedTicket.priority}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">ผู้แจ้ง:</span>
                  <span className="font-medium text-slate-800">{selectedTicket.requester.name}</span>
                </div>
              </div>

              {/* Status Workflow Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase">เปลี่ยนสถานะการทำงาน:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, TicketStatus.IN_PROGRESS)}
                    className="p-2 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 font-medium"
                  >
                    ▶ รับเรื่อง / In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, TicketStatus.RESOLVED)}
                    className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100 font-medium"
                  >
                    ✔ แก้ไขแล้ว (Resolved)
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, TicketStatus.PENDING_USER)}
                    className="p-2 bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 font-medium"
                  >
                    ⏸ รอข้อมูลจากผู้ใช้
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, TicketStatus.CLOSED)}
                    className="p-2 bg-slate-100 text-slate-700 rounded border border-slate-200 hover:bg-slate-200 font-medium"
                  >
                    🔒 ปิดงาน (Closed)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
