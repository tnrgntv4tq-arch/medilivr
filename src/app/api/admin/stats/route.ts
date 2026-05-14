import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    deliveredOrders,
    activeOrders,
    recentOrders,
    usersByRole,
    ordersLast7Days,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true }, where: { paid: true } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
  ]);

  const roleMap = Object.fromEntries(usersByRole.map(r => [r.role, r._count]));
  const statusMap = Object.fromEntries(ordersLast7Days.map(r => [r.status, r._count]));

  return NextResponse.json({
    stats: {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      deliveredOrders,
      activeOrders,
      recentOrders,
      usersByRole: roleMap,
      ordersLast7Days: statusMap,
    },
  });
}
