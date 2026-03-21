import { useEffect, useState } from "react";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

interface OrderRow {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  total: number;
  createdAt: string;
  user: { email: string };
  items?: any[]; // for detail modal
}

export function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pendingDeleteOrderId, setPendingDeleteOrderId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const pageSize = 10;

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const list = await apiFetch<OrderRow[]>("/admin/orders", { token });
      setOrders(list);
    } catch {
      toast.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function changeStatus(
    id: string,
    status: "PENDING" | "PAID" | "CANCELLED",
  ) {
    if (!token) return;
    try {
      await apiFetch(`/admin/orders/${id}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      toast.success("Đã cập nhật trạng thái đơn hàng");
      load();
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  }

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = orders
    ? orders.filter((o) => {
        const searchLower = search.toLowerCase();
        const matchSearch =
          o.id.toLowerCase().includes(searchLower) ||
          o.user?.email?.toLowerCase().includes(searchLower);
        const matchStatus = statusFilter ? o.status === statusFilter : true;
        return matchSearch && matchStatus;
      })
    : [];

  // Lấy chi tiết đơn hàng từ API
  async function openDetail(orderId: string) {
    if (!token) return;
    setDetailLoading(true);
    try {
      const detail = await apiFetch<any>(`/admin/orders/${orderId}`, { token });
      setDetailOrder(detail);
    } catch {
      toast.error("Lỗi tải chi tiết đơn hàng");
    } finally {
      setDetailLoading(false);
    }
  }

  function requestDelete(orderId: string) {
    setPendingDeleteOrderId(orderId);
  }

  async function confirmDelete() {
    if (!token || !pendingDeleteOrderId) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/admin/orders/${pendingDeleteOrderId}`, {
        method: "DELETE",
        token,
      });
      toast.success("Đã xoá đơn hàng");
      if (detailOrder?.id === pendingDeleteOrderId) setDetailOrder(null);
      setPendingDeleteOrderId(null);
      load();
    } catch {
      toast.error("Lỗi xoá đơn hàng");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quản lý đơn hàng</CardTitle>
          <div className="flex flex-wrap gap-2 mt-3">
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Tìm kiếm mã đơn, email khách..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: 220 }}
            />
            <select
              className="border rounded px-2 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading || !orders ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Mã đơn</th>
                    <th className="p-2">Khách</th>
                    <th className="p-2 text-right">Tổng tiền</th>
                    <th className="p-2">Trạng thái</th>
                    <th className="p-2">Ngày tạo</th>
                    <th className="p-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const totalPages = Math.max(
                      1,
                      Math.ceil(filteredOrders.length / pageSize),
                    );
                    const safePage = Math.min(page, totalPages);
                    const startIndex = (safePage - 1) * pageSize;
                    const pageOrders = filteredOrders.slice(
                      startIndex,
                      startIndex + pageSize,
                    );
                    return pageOrders.map((o) => (
                      <tr key={o.id} className="border-b last:border-b-0">
                        <td className="p-2 font-medium">
                          <button
                            className="underline text-blue-600 hover:text-blue-800"
                            onClick={() => openDetail(o.id)}
                            type="button"
                          >
                            {o.id}
                          </button>
                        </td>
                        <td className="p-2">{o.user?.email}</td>
                        <td className="p-2 text-right">
                          {o.total.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="p-2">
                          <Select
                            value={o.status}
                            onChange={(e) =>
                              changeStatus(
                                o.id,
                                e.target.value as
                                  | "PENDING"
                                  | "PAID"
                                  | "CANCELLED",
                              )
                            }
                          >
                            <option value="PENDING">Đang xử lý</option>
                            <option value="PAID">Đã thanh toán</option>
                            <option value="CANCELLED">Đã hủy</option>
                          </Select>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {new Date(o.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="p-2 text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => requestDelete(o.id)}
                          >
                            Xoá
                          </Button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              {filteredOrders.length > pageSize && (
                <div className="flex items-center justify-center gap-3 pt-3 text-sm">
                  <button
                    type="button"
                    className="rounded border px-3 py-1 text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Trang trước
                  </button>
                  <span className="text-muted-foreground">
                    Trang {page}/
                    {Math.max(1, Math.ceil(filteredOrders.length / pageSize))}
                  </span>
                  <button
                    type="button"
                    className="rounded border px-3 py-1 text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      page >= Math.ceil(filteredOrders.length / pageSize)
                    }
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(
                          Math.max(
                            1,
                            Math.ceil(filteredOrders.length / pageSize),
                          ),
                          prev + 1,
                        ),
                      )
                    }
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmModal
        open={pendingDeleteOrderId !== null}
        title="Xoá đơn hàng"
        description={
          pendingDeleteOrderId
            ? `Bạn chắc chắn muốn xoá đơn hàng ${pendingDeleteOrderId}? Hành động này không thể hoàn tác.`
            : undefined
        }
        confirmText="Xoá"
        confirmVariant="destructive"
        loading={deleteLoading}
        onCancel={() => setPendingDeleteOrderId(null)}
        onConfirm={confirmDelete}
      />
      <OrderDetailModal
        open={!!detailOrder || detailLoading}
        onClose={() => setDetailOrder(null)}
        order={detailOrder}
        onDelete={(id) => {
          setDetailOrder(null);
          requestDelete(id);
        }}
      />
    </>
  );
}
