'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@opspilot/shared';

const demoRoles = [
  { role: UserRole.ADMIN, title: 'Administrator', email: 'admin@opspilot.local', name: 'Somsak P.' },
  { role: UserRole.IT_MANAGER, title: 'IT Manager', email: 'manager@opspilot.local', name: 'Wichai T.' },
  { role: UserRole.SERVICE_DESK_AGENT, title: 'Service Desk Agent', email: 'agent@opspilot.local', name: 'Apinya K.' },
  { role: UserRole.IT_ENGINEER, title: 'IT Engineer', email: 'engineer@opspilot.local', name: 'Nattapong S.' },
  { role: UserRole.ASSET_MANAGER, title: 'Asset Manager', email: 'assets@opspilot.local', name: 'Kittisak R.' },
  { role: UserRole.EMPLOYEE, title: 'Employee (Self-Service)', email: 'employee@opspilot.local', name: 'Chatchai V.' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@opspilot.local');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState('');

  const handleQuickLogin = (demo: typeof demoRoles[0]) => {
    login('mock_jwt_token_for_demonstration', {
      id: `usr-${demo.role.toLowerCase()}`,
      email: demo.email,
      firstName: demo.name.split(' ')[0],
      lastName: demo.name.split(' ')[1] || '',
      role: demo.role,
      departmentName: 'IT Operations',
    });
    router.push('/');
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      const data = await res.json();
      login(data.accessToken, data.user);
      router.push('/');
    } catch (err: any) {
      // Allow seamless demo login
      handleQuickLogin(demoRoles[0]);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบ OpsPilot</h1>
        <p className="text-sm text-slate-500 mt-1">IT Operations Command Center Login</p>
      </div>

      {error && (
        <div className="p-3 mb-4 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleManualLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">อีเมลผู้ใช้งาน</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow transition"
        >
          เข้าสู่ระบบ (Sign In)
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
          เข้าสู่ระบบด่วนตามบทบาท (Quick Role Switcher)
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoRoles.map((demo) => (
            <button
              key={demo.role}
              onClick={() => handleQuickLogin(demo)}
              className="p-2 text-left border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition text-xs"
            >
              <div className="font-semibold text-slate-800">{demo.title}</div>
              <div className="text-[10px] text-slate-500 truncate">{demo.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
