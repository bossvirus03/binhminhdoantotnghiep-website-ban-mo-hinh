import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/http';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardStats = {
  userCount: number;
  productCount: number;
  orderCount: number;
  revenue: number;
  ordersLast7Days: { date: string; label: string; orders: number; revenue: number }[];
  revenueByCategory: { category: string; value: number }[];
};

export function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiFetch<DashboardStats>('/admin/dashboard', { token })
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {stats.userCount}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {stats.productCount}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {stats.orderCount}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {stats.revenue.toLocaleString('vi-VN')}đ
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {!stats || loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Đơn hàng 7 ngày gần nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Doanh thu theo danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Đơn hàng 7 ngày gần nhất</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.ordersLast7Days.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có đơn hàng nào.</p>
              ) : (
                <div className="flex h-40 items-end gap-2">
                  {(() => {
                    const maxOrders = Math.max(
                      ...stats.ordersLast7Days.map((d) => d.orders),
                      1,
                    );
                    return stats.ordersLast7Days.map((d) => (
                      <div
                        key={d.date}
                        className="flex flex-1 flex-col items-center gap-1 text-[11px]"
                      >
                        <div className="flex h-full w-full items-end rounded bg-muted">
                          <div
                            className="w-full rounded bg-primary"
                            style={{ height: `${(d.orders / maxOrders) * 100}%` }}
                          />
                        </div>
                        <div className="text-muted-foreground">{d.label}</div>
                        <div className="font-semibold">{d.orders}</div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Doanh thu theo danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.revenueByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu.</p>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const maxValue = Math.max(
                      ...stats.revenueByCategory.map((c) => c.value),
                      1,
                    );
                    return stats.revenueByCategory.map((c) => (
                      <div key={c.category} className="space-y-1 text-sm">
                        <div className="flex justify-between gap-2 text-xs">
                          <span className="font-medium">{c.category}</span>
                          <span className="text-muted-foreground">
                            {c.value.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded bg-muted">
                          <div
                            className="h-full rounded bg-primary/80"
                            style={{ width: `${(c.value / maxValue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
