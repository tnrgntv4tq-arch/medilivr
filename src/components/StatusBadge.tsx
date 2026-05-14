'use client';

import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  PREPARING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  READY: 'bg-purple-50 text-purple-700 border-purple-200',
  PICKED_UP: 'bg-orange-50 text-orange-700 border-orange-200',
  IN_TRANSIT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status }: { status: string }) {
  const label = ORDER_STATUS_LABELS[status as OrderStatus] || status;
  const style = STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
}
