const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// In-memory demo data store for Vercel / standalone mode
const demoStore: Record<string, any> = {
  '/dashboard/summary': {
    openIncidents: 4,
    criticalIncidents: 1,
    activeServiceRequests: 6,
    slaBreaches: 0,
    onlineDevices: 6,
    offlineDevices: 1,
    totalAssets: 42,
    pendingApprovals: 2,
  },
  '/dashboard/recent-activities': [
    { id: '1', action: 'STATUS_CHANGED', entityType: 'Ticket', createdAt: new Date().toISOString() },
    { id: '2', action: 'CHANGE_APPROVED', entityType: 'ChangeRequest', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  '/service-catalog': [
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
  ],
  '/sla/policies': [
    { priority: 'P1', name: 'Critical Outage (P1)', firstResponse: '15 นาที', resolution: '4 ชั่วโมง', target: '99.5%' },
    { priority: 'P2', name: 'High Degradation (P2)', firstResponse: '1 ชั่วโมง', resolution: '8 ชั่วโมง', target: '98.0%' },
    { priority: 'P3', name: 'Medium Standard (P3)', firstResponse: '4 ชั่วโมงทำการ', resolution: '3 วันทำการ', target: '95.0%' },
    { priority: 'P4', name: 'Low Request (P4)', firstResponse: '1 วันทำการ', resolution: '5 วันทำการ', target: '90.0%' },
  ],
};

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('opspilot_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback to demo data for Vercel deployment without backend
  }

  // Return fallback demo data if present
  const baseKey = endpoint.split('?')[0];
  if (demoStore[baseKey]) {
    return demoStore[baseKey] as T;
  }

  return [] as unknown as T;
}
