import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCart, setCart } from '../lib/storage';
import type { CartItem } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

function formatMoney(v: number) {
  return v.toLocaleString('vi-VN');
}

const FALLBACK_IMAGE_URL =
  'https://bizweb.dktcdn.net/100/442/971/products/did-027-5-f7c2b16a-8f8e-4d4c-aeec-9d56c1a042b9.jpg?v=1759163974073';

function handleImageError(e: { currentTarget: HTMLImageElement }) {
  if (e.currentTarget.src !== FALLBACK_IMAGE_URL) {
    e.currentTarget.src = FALLBACK_IMAGE_URL;
  }
}

export function CartPage() {
  // const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[] | null>(null);
  // toast from sonner

  useEffect(() => {
    setTimeout(() => setItems(getCart()), 400); // fake loading
  }, []);

  const subtotal = useMemo(
    () => (items ? items.reduce((sum, i) => sum + i.price * i.quantity, 0) : 0),
    [items],
  );

  function updateQuantity(productId: string, quantity: number) {
    if (!items) return;
    const next = items
      .map((i) => (i.productId === productId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    setItems(next);
    setCart(next);
    toast.success('Đã cập nhật số lượng');
  }

  function remove(productId: string) {
    if (!items) return;
    const next = items.filter((i) => i.productId !== productId);
    setItems(next);
    setCart(next);
    toast.success('Đã xóa sản phẩm khỏi giỏ');
  }

  if (items === null) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quản lí giỏ hàng</h2>
          <p className="text-sm text-muted-foreground">Cập nhật số lượng và tiến hành thanh toán.</p>
        </div>
        <div className="space-y-2">
          <div className="h-16 w-full rounded-md bg-muted animate-pulse" />
          <div className="h-32 w-full rounded-md bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quản lí giỏ hàng</h2>
          <p className="text-sm text-muted-foreground">Cập nhật số lượng và tiến hành thanh toán.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giỏ hàng trống</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/products">Xem sản phẩm</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quản lí giỏ hàng</h2>
        <p className="text-sm text-muted-foreground">Cập nhật số lượng và tiến hành thanh toán.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-[500px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Sản phẩm</th>
                  <th className="py-2 text-right font-medium">Đơn giá</th>
                  <th className="py-2 text-center font-medium">Số lượng</th>
                  <th className="py-2 text-right font-medium">Thành tiền</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.productId} className="border-b last:border-b-0">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                          <img
                            src={i.imageUrl ?? FALLBACK_IMAGE_URL}
                            alt={i.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                          />
                        </div>
                        <div className="font-medium line-clamp-2">{i.name}</div>
                      </div>
                    </td>
                    <td className="py-3 text-right">{formatMoney(i.price)}đ</td>
                    <td className="py-3">
                      <div className="flex justify-center">
                        <Input
                          type="number"
                          min={0}
                          value={i.quantity}
                          onChange={(e) =>
                            updateQuantity(i.productId, Number(e.target.value))
                          }
                          className="w-20 sm:w-24"
                        />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      {formatMoney(i.price * i.quantity)}đ
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(i.productId)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row justify-end">
        <Card className="w-full max-w-sm mt-4 sm:mt-0 sm:ml-auto">
          <CardHeader>
            <CardTitle className="text-lg">Tổng kết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-medium">{formatMoney(subtotal)}đ</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
