import React from 'react'
import connectDb from '@/lib/db'
import Order from '@/models/order.model'
import User from '@/models/user.model'
import AdminDashboardClient from './AdminDashboardClient'


async function AdminDashboard() {
  await connectDb();

  const totalCustomers = await User.countDocuments({ role: "user" });

  const today = new Date()
  const startOfToday = new Date(today)
  startOfToday.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const aggResult = await Order.aggregate([
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
              pendingDeliveries: {
                $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
              }
            }
          }
        ],
        todayStats: [
          { $match: { createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, revenue: { $sum: { $ifNull: ["$totalAmount", 0] } } } }
        ],
        sevenDaysStats: [
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          { $group: { _id: null, revenue: { $sum: { $ifNull: ["$totalAmount", 0] } } } }
        ],
        chartStats: [
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              ordersCount: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  const data = aggResult[0];
  const totalOrders = data.overall[0]?.totalOrders || 0;
  const totalRevenue = data.overall[0]?.totalRevenue || 0;
  const pendingDeliveries = data.overall[0]?.pendingDeliveries || 0;
  
  const todayRevenue = data.todayStats[0]?.revenue || 0;
  const sevenDaysRevenue = data.sevenDaysStats[0]?.revenue || 0;

  const stats = [
    { title: "Total Orders", value: totalOrders },
    { title: "Total Customers", value: totalCustomers },
    { title: "Pending Deliveries", value: pendingDeliveries },
    { title: "Total Revenue", value: totalRevenue }
  ];

  const chartData = []
  const chartMap = new Map();
  data.chartStats.forEach((stat: any) => {
    chartMap.set(stat._id, stat.ordersCount);
  });

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Format date string to match MongoDB UTC output (%Y-%m-%d)
    const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];

    chartData.push({
      day: date.toLocaleDateString("en-us", { weekday: "short" }),
      orders: chartMap.get(dateStr) || 0
    })
  }

  return (
    <>
      <AdminDashboardClient earning={{
        today: todayRevenue,
        sevenDays: sevenDaysRevenue,
        total: totalRevenue

      }}
        stats={stats}
        chartData={chartData}

      />
    </>

  )
}

export default AdminDashboard
