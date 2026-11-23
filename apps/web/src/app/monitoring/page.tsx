'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Flame,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { MonitoringTargetDto } from '@opspilot/api-contracts';
import { MonitoringStatus } from '@opspilot/shared';

const initialTargets: MonitoringTargetDto[] = [
  {
    id: 'tgt-1',
    hostname: 'WEB-SERVER-01',
    ipAddress: '10.0.1.10',
    deviceType: 'Web Server',
    environment: 'PRODUCTION',
    location: 'Bangkok DC',
    status: MonitoringStatus.UP,
    lastHeartbeat: new Date().toISOString(),
    cpuUsage: 22.4,
    memoryUsage: 45.1,
    diskUsage: 54.0,
    responseTimeMs: 12.0,
    uptimeSeconds: 864000,
    isSimulated: true,
  },
  {
    id: 'tgt-2',
    hostname: 'DB-SERVER-01',
    ipAddress: '10.0.2.20',
    deviceType: 'PostgreSQL Database',
    environment: 'PRODUCTION',
    location: 'Bangkok DC',
    status: MonitoringStatus.UP,
    lastHeartbeat: new Date().toISOString(),
    cpuUsage: 35.8,
    memoryUsage: 68.2,
    diskUsage: 71.5,
    responseTimeMs: 8.5,
    uptimeSeconds: 1540000,
    isSimulated: true,
  },
  {
    id: 'tgt-3',
    hostname: 'CORE-SWITCH-01',
    ipAddress: '10.0.0.1',
    deviceType: 'Network Switch',
    environment: 'PRODUCTION',
    location: 'Bangkok DC Rack A',
    status: MonitoringStatus.UP,
    lastHeartbeat: new Date().toISOString(),
    cpuUsage: 12.0,
    memoryUsage: 25.0,
    diskUsage: 15.0,
    responseTimeMs: 1.2,
    uptimeSeconds: 2900000,
    isSimulated: true,
  },
];

export default function MonitoringPage() {
  const [targets, setTargets] = useState<MonitoringTargetDto[]>(initialTargets);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    apiFetch<MonitoringTargetDto[]>('/monitoring/targets')
      .then((data) => {
        if (data && data.length > 0) setTargets(data);
      })
      .catch(() => {});
  }, []);

  const triggerSimulation = async (scenario: 'SERVER_DOWN' | 'CPU_SPIKE' | 'RECOVERY') => {
    setIsSimulating(true);

    if (scenario === 'SERVER_DOWN') {
      setTargets((prev) =>
        prev.map((t) =>
          t.hostname === 'WEB-SERVER-01'
            ? { ...t, status: MonitoringStatus.DOWN, cpuUsage: 0, responseTimeMs: 0 }
            : t
        )
      );
      setSimulationLog((prev) => [
        `[CRITICAL ${new Date().toLocaleTimeString()}] WEB-SERVER-01 DOWN. Watchdog triggered Incident INC-2026-00001 (Priority P1).`,
        ...prev,
      ]);
    } else if (scenario === 'CPU_SPIKE') {
      setTargets((prev) =>
        prev.map((t) =>
          t.hostname === 'WEB-SERVER-01'
            ? { ...t, status: MonitoringStatus.DEGRADED, cpuUsage: 96.8 }
            : t
        )
      );
      setSimulationLog((prev) => [
        `[WARNING ${new Date().toLocaleTimeString()}] CPU Spike on WEB-SERVER-01 reached 96.8%.`,
        ...prev,
      ]);
    } else if (scenario === 'RECOVERY') {
      setTargets((prev) =>
        prev.map((t) =>
          t.hostname === 'WEB-SERVER-01'
            ? { ...t, status: MonitoringStatus.UP, cpuUsage: 21.5, responseTimeMs: 12.5 }
            : t
        )
      );
      setSimulationLog((prev) => [
        `[INFO ${new Date().toLocaleTimeString()}] WEB-SERVER-01 has fully recovered to healthy status.`,
        ...prev,
      ]);
    }

    try {
      await apiFetch('/monitoring/simulate', {
        method: 'POST',
        body: JSON.stringify({ scenario }),
      });
    } catch {}

    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Infrastructure Monitoring Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            การติดตามสถานะเซิร์ฟเวอร์ เครือข่าย และระบบจำลองความผิดปกติอัตโนมัติ (Synthetic Simulator)
          </p>
        </div>
      </div>

      {/* Manual Simulation Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase mb-3 tracking-wider">
          แผงควบคุมการจำลองเหตุการณ์ (Simulation Sandbox Controls)
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => triggerSimulation('SERVER_DOWN')}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Flame className="w-4 h-4" />
            Simulate Server Down (สร้าง Incident P1 อัตโนมัติ)
          </button>
          <button
            onClick={() => triggerSimulation('CPU_SPIKE')}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Cpu className="w-4 h-4" />
            Simulate CPU Spike (&gt;90%)
          </button>
          <button
            onClick={() => triggerSimulation('RECOVERY')}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simulate Recovery (กู้คืนสถานะปกติ)
          </button>
        </div>
      </div>

      {/* Target Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {targets.map((tgt) => (
          <div
            key={tgt.id}
            className={`bg-white rounded-xl border p-5 shadow-sm transition ${
              tgt.status === MonitoringStatus.DOWN
                ? 'border-red-300 ring-2 ring-red-100'
                : tgt.status === MonitoringStatus.DEGRADED
                ? 'border-amber-300 ring-2 ring-amber-100'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{tgt.hostname}</div>
                  <div className="text-[11px] text-slate-400">{tgt.ipAddress}</div>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  tgt.status === MonitoringStatus.UP
                    ? 'bg-emerald-100 text-emerald-800'
                    : tgt.status === MonitoringStatus.DOWN
                    ? 'bg-red-100 text-red-800 animate-pulse'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {tgt.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">CPU Usage</span>
                  <span className="font-semibold text-slate-800">{tgt.cpuUsage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${tgt.cpuUsage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(tgt.cpuUsage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Memory Usage</span>
                  <span className="font-semibold text-slate-800">{tgt.memoryUsage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${tgt.memoryUsage}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                <span>Response Time: {tgt.responseTimeMs} ms</span>
                <span>{tgt.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simulation Events Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-bold text-slate-800 text-base mb-3">บันทึกเหตุการณ์เฝ้าระวัง (Monitoring Event Stream)</h2>
        <div className="space-y-2 text-xs font-mono">
          {simulationLog.length === 0 ? (
            <div className="text-slate-400 italic">กดปุ่ม Simulation ด้านบนเพื่อทดสอบกลไกตรวจจับและสร้าง Incident อัตโนมัติ</div>
          ) : (
            simulationLog.map((log, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border ${
                  log.includes('CRITICAL')
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : log.includes('WARNING')
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
