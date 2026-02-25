import { useState } from 'react';
import { apiFetch } from '../api/http';
import { useAuth } from '../auth/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePasswordPage() {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setInfo(null);
    try {
      const res = await apiFetch<{ ok: boolean; message?: string }>(
        '/users/change-password',
        {
          method: 'POST',
          token,
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );
      if (!res.ok) {
        setError(res.message ?? 'Đổi mật khẩu thất bại');
        return;
      }
      setInfo('Đổi mật khẩu thành công.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err?.message ?? 'Đổi mật khẩu thất bại');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu cho tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mật khẩu hiện tại"
                type="password"
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (>=6 ký tự)"
                type="password"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit">Xác nhận</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
