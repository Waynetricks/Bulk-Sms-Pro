import React from 'react';

interface DashboardStatsProps {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
}

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className={`${color} rounded-xl shadow-lg p-8 text-white transform transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 cursor-pointer border-2 border-opacity-20 border-white`}>
    <p className="text-sm font-medium opacity-90 uppercase tracking-wide">{label}</p>
    <p className="text-4xl font-bold mt-3">{value.toLocaleString()}</p>
    <div className="mt-4 h-1 bg-white bg-opacity-30 rounded-full"></div>
  </div>
);

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalSent,
  delivered,
  failed,
  pending,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard label="Total Sent" value={totalSent} color="bg-blue-500" />
      <StatCard label="Delivered" value={delivered} color="bg-green-500" />
      <StatCard label="Failed" value={failed} color="bg-red-500" />
      <StatCard label="Pending" value={pending} color="bg-yellow-500" />
    </div>
  );
};
