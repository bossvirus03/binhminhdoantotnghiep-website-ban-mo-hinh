import { useMemo, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/http';
import { useAuth } from '../auth/AuthContext';
import { getCart, setCart } from '../lib/storage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function formatMoney(v: number) {
  return v.toLocaleString('vi-VN');
}

type CheckoutResult = {
  id: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: Array<{ productId: string; productName: string; unitPrice: number; quantity: number; lineTotal: number }>;
};

export function CheckoutPage() {
  const { token, user, refreshMe } = useAuth();
  const cart = useMemo(() => getCart(), []);

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD');
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function submit() {
    if (!token) return;
    setError(null);
    try {
      const res = await apiFetch<CheckoutResult>('/orders/checkout', {
        method: 'POST',
        token,
        body: JSON.stringify({
          paymentMethod,
          fullName,
          phone,
          address,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      setResult(res);
      setCart([]);
      await refreshMe();
      toast.success('Đặt hàng thành công!');
    } catch (e: any) {
      setError(e?.message ?? 'Checkout failed');
      toast.error('Đặt hàng thất bại!');
    }
  }

  if (cart.length === 0 && !result) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Thanh toán/Đặt hàng</h2>
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
        <h2 className="text-2xl font-semibold tracking-tight">Thanh toán/Đặt hàng</h2>
        <p className="text-sm text-muted-foreground">
          Xác nhận phương thức thanh toán và thông tin nhận hàng.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Đặt hàng thành công</CardTitle>
            <CardDescription>Cảm ơn bạn đã đặt hàng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Mã đơn</span>: <Badge variant="secondary">{result.id}</Badge>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Tổng tiền</span>: {formatMoney(result.total)}đ
            </div>
            <div className="pt-2">
              <Button asChild>
                <Link to="/products">Tiếp tục mua hàng</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phương thức thanh toán</CardTitle>
              <CardDescription>Chọn cách bạn muốn thanh toán.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent">
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <div>
                  <div className="text-sm font-medium">COD</div>
                  <div className="text-sm text-muted-foreground">Thanh toán khi nhận hàng</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent">
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                />
                <div>
                  <div className="text-sm font-medium">Chuyển khoản</div>
                  <div className="text-sm text-muted-foreground">Chuyển khoản ngân hàng</div>
                </div>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin nhận hàng</CardTitle>
              <CardDescription>Nhập địa chỉ và liên hệ để giao hàng.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="fullName">Họ tên</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">SĐT</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Xác nhận thanh toán</CardTitle>
              <CardDescription>Kiểm tra tổng tiền trước khi đặt hàng.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">Tạm tính</span>: <span className="font-medium">{formatMoney(subtotal)}đ</span>
              </div>
              <Button onClick={submit}>Xác nhận thanh toán</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
