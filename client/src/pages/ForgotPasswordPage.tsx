import { useState } from 'react';
import { apiFetch } from '../api/http';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestToken(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      const res = await apiFetch<{ ok: boolean; token?: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
      );
      setInfo('Đã gửi yêu cầu đặt lại mật khẩu.');
      setToken(res.token ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed');
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setInfo(null);
    try {
      await apiFetch<{ ok: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setInfo('Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.');
    } catch (err: any) {
      setError(err?.message ?? 'Reset failed');
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>Gửi yêu cầu đặt lại mật khẩu theo email.</CardDescription>
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

          <form onSubmit={requestToken} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
            </div>
            <Button type="submit">Gửi yêu cầu</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Dev mode: token sẽ hiển thị ở đây (thay vì email).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Token:</span>
            {token ? (
              <Badge variant="secondary" className="break-all">
                {token}
              </Badge>
            ) : (
              <span>—</span>
            )}
          </div>

          <form onSubmit={reset} className="grid gap-3">
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
            <Button type="submit" disabled={!token}>
              Xác nhận
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
