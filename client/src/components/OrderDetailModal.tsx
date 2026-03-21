import React from "react";
import { Button } from "@/components/ui/button";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: any | null;
  onDelete?: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  onClose,
  order,
  onDelete,
}) => {
  if (!open || !order) return null;

  const canDelete = typeof onDelete === "function";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Chi tiết đơn hàng</h2>
        <div className="mb-2 text-sm">
          <div>
            <b>Mã đơn:</b> {order.id}
          </div>
          <div>
            <b>Khách:</b> {order.user?.email}
          </div>
          <div>
            <b>Trạng thái:</b> {order.status}
          </div>
          <div>
            <b>Ngày tạo:</b> {new Date(order.createdAt).toLocaleString("vi-VN")}
          </div>
          <div>
            <b>Tổng tiền:</b> {order.total?.toLocaleString("vi-VN")}đ
          </div>
        </div>
        {order.items && (
          <div className="mt-4">
            <div className="font-semibold mb-2">Sản phẩm:</div>
            <table className="w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-1 border">Tên SP</th>
                  <th className="p-1 border">SL</th>
                  <th className="p-1 border">Đơn giá</th>
                  <th className="p-1 border">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.productId}>
                    <td className="p-1 border">{item.productName}</td>
                    <td className="p-1 border text-center">{item.quantity}</td>
                    <td className="p-1 border text-right">
                      {item.unitPrice.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-1 border text-right">
                      {item.lineTotal.toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {canDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(order.id)}
            >
              Xoá đơn hàng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
