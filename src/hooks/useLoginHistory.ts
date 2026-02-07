/**
 * SGG Digital — Hook Historique des Connexions
 */

import { useState, useMemo } from 'react';
import { useDemoUser } from './useDemoUser';
import type { LoginHistoryEntry } from '@/types/user-profile';

const MOCK_HISTORY: LoginHistoryEntry[] = [
  { id: 'log-001', date: '2026-02-07T08:30:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-002', date: '2026-02-06T14:15:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-003', date: '2026-02-06T09:00:00Z', ipAddress: '41.158.22.108', browser: 'Safari 17', device: 'iPhone 15', location: 'Libreville', success: true },
  { id: 'log-004', date: '2026-02-05T18:45:00Z', ipAddress: '197.234.45.12', browser: 'Firefox 122', device: 'PC Windows', location: 'Franceville', success: false },
  { id: 'log-005', date: '2026-02-05T16:30:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-006', date: '2026-02-04T10:00:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-007', date: '2026-02-03T08:15:00Z', ipAddress: '41.158.22.108', browser: 'Safari 17', device: 'iPhone 15', location: 'Libreville', success: true },
  { id: 'log-008', date: '2026-02-02T22:10:00Z', ipAddress: '196.1.95.5', browser: 'Chrome 120', device: 'PC Windows', location: 'Port-Gentil', success: false },
  { id: 'log-009', date: '2026-02-01T07:45:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-010', date: '2026-01-31T14:20:00Z', ipAddress: '41.158.22.108', browser: 'Safari 17', device: 'iPhone 15', location: 'Libreville', success: true },
  { id: 'log-011', date: '2026-01-30T09:10:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-012', date: '2026-01-29T16:00:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-013', date: '2026-01-28T11:30:00Z', ipAddress: '197.234.45.12', browser: 'Firefox 122', device: 'PC Windows', location: 'Franceville', success: true },
  { id: 'log-014', date: '2026-01-27T08:00:00Z', ipAddress: '41.158.22.105', browser: 'Chrome 121', device: 'MacBook Pro', location: 'Libreville', success: true },
  { id: 'log-015', date: '2026-01-26T19:45:00Z', ipAddress: '41.158.22.108', browser: 'Safari 17', device: 'iPhone 15', location: 'Libreville', success: true },
];

export function useLoginHistory() {
  const { demoUser } = useDemoUser();
  const isDemo = !!demoUser;

  const [currentPage, setCurrentPage] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const itemsPerPage = 10;

  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const periodMs: Record<string, number> = {
      '7d': 7 * 86400000,
      '30d': 30 * 86400000,
      '90d': 90 * 86400000,
      'all': Infinity,
    };
    const cutoff = now - (periodMs[filterPeriod] || Infinity);
    return MOCK_HISTORY.filter((h) => new Date(h.date).getTime() >= cutoff);
  }, [filterPeriod]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const stats = useMemo(() => ({
    total: filteredHistory.length,
    success: filteredHistory.filter((h) => h.success).length,
    failed: filteredHistory.filter((h) => !h.success).length,
  }), [filteredHistory]);

  const exportCsv = () => {
    const headers = 'Date,IP,Navigateur,Appareil,Localisation,Statut\n';
    const rows = filteredHistory.map((h) =>
      `${h.date},${h.ipAddress},${h.browser},${h.device},${h.location || '-'},${h.success ? 'Succès' : 'Échec'}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-connexions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    history: paginatedHistory,
    totalPages,
    currentPage,
    setCurrentPage,
    filterPeriod,
    setFilterPeriod,
    stats,
    isDemo,
    exportCsv,
  };
}
