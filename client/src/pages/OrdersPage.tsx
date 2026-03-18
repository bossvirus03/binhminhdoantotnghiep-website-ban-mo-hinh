import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { Order } from "../types";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function statusColor(status: Order["status"]) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
}

function statusLabel(status: Order["status"]) {
  switch (status) {
    case "PAID":
      return "Đã thanh toán";
    case "CANCELLED":
      return "Đã hủy";
    case "PENDING":
    default:
      return "Đang xử lý";
  }
}

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Order[]>("/orders/my", { token });
      setOrders(data);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const empty = useMemo(
    () => !loading && (orders?.length ?? 0) === 0,
    [loading, orders],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Đơn hàng của bạn
        </h2>
        <p className="text-sm text-muted-foreground">
          Xem lại các đơn đã đặt và trạng thái xử lý.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx}>
              <CardHeader>
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {empty && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Bạn chưa có đơn hàng nào. Hãy đặt sản phẩm yêu thích để bắt đầu!
          </CardContent>
        </Card>
      )}

      {!loading && orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">
                    Mã đơn: {order.id}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(order.status)}>
                    {statusLabel(order.status)}
                  </Badge>
                  <Badge variant="outline">
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Chuyển khoản"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-medium">Tổng:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(order.total)}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Người nhận: {order.fullName || "(chưa có)"}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>SĐT: {order.phone || "(chưa có)"}</span>
                </div>

                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-12 w-12 rounded object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded border bg-muted" />
                        )}
                        <div>
                          <div className="font-medium leading-tight">
                            {item.productName}
                          </div>
                          <div className="text-muted-foreground">
                            SL: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(item.lineTotal)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} / sản phẩm
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ... và {order.items.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setSelected(order)}>
                    Xem chi tiết
                  </Button>
                  <Button variant="ghost" size="sm" onClick={load}>
                    Làm mới
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OrderDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        order={selected}
      />
    </div>
  );
}
