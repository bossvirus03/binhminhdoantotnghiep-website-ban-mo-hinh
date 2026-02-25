import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/http';
import { useAuth } from '../auth/AuthContext';
import type { User } from '../types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AccountPage() {
  const { token, user, refreshMe } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setInfo(null);
    try {
      await apiFetch<User>('/users/me', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ fullName, phone, address }),
      });
      await refreshMe();
      setInfo('Cập nhật thông tin thành công.');
    } catch (err: any) {
      setError(err?.message ?? 'Update failed');
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quản lí tài khoản</h2>
        <p className="text-sm text-muted-foreground">Cập nhật thông tin nhận hàng.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {info && (
        <Alert>
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin</CardTitle>
          <CardDescription>Email: {user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ tên"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">SĐT</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="SĐT"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">Lưu</Button>
              <Button asChild variant="outline">
                <Link to="/change-password">Đổi mật khẩu</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
