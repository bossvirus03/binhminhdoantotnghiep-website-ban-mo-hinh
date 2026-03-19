import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/http';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '../types';

export function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const currentUserId = useMemo(() => {
    try {
      const stored = localStorage.getItem('accessToken');
      return stored ? JSON.parse(atob(stored.split('.')[1]))?.sub : null;
    } catch {
      return null;
    }
  }, []);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const list = await apiFetch<User[]>('/admin/users', { token });
      setUsers(list);
    } catch {
      toast.error('Lỗi tải người dùng');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function changeRole(id: string, role: 'user' | 'admin') {
    if (!token) return;
    try {
      await apiFetch(`/admin/users/${id}/role`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ role }),
      });
      toast.success('Đã cập nhật quyền');
      load();
    } catch {
      toast.error('Lỗi cập nhật quyền');
    }
  }

  async function removeUser(id: string) {
    if (!token) return;
    if (currentUserId && id === currentUserId) {
      toast.error('Không thể xóa tài khoản của bạn');
      return;
    }
    if (!confirm('Xóa người dùng này?')) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE', token });
      toast.success('Đã xóa người dùng');
      load();
    } catch {
      toast.error('Lỗi xóa người dùng');
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!newEmail || !newPassword) {
      toast.error('Nhập email và mật khẩu');
      return;
    }
    setCreating(true);
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        token,
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
      });
      toast.success('Đã tạo người dùng');
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      setShowCreate(false);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? 'Lỗi tạo người dùng');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quản lý khách hàng</CardTitle>
        <div className="mt-3">
          <Button onClick={() => setShowCreate(true)}>Tạo người dùng</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading || !users ? (
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
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2">Tên</th>
                  <th className="p-2">SĐT</th>
                  <th className="p-2">Quyền</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
                  const safePage = Math.min(page, totalPages);
                  const startIndex = (safePage - 1) * pageSize;
                  const pageUsers = users.slice(startIndex, startIndex + pageSize);
                  return pageUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0">
                    <td className="p-2 font-medium">{u.email}</td>
                    <td className="p-2">{u.fullName}</td>
                    <td className="p-2">{u.phone}</td>
                    <td className="p-2">
                      <Select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value as 'user' | 'admin')}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </Select>
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeUser(u.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ));
                })()}
              </tbody>
            </table>
            {users.length > pageSize && (
              <div className="flex items-center justify-center gap-3 pt-3 text-sm">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Trang trước
                </Button>
                <span className="text-muted-foreground">
                  Trang {page}/{Math.max(1, Math.ceil(users.length / pageSize))}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page >= Math.ceil(users.length / pageSize)}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(Math.max(1, Math.ceil(users.length / pageSize)), prev + 1),
                    )
                  }
                >
                  Trang sau
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Thêm người dùng</h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowCreate(false)}
              >
                ×
              </button>
            </div>
            <form className="mt-4 grid gap-3" onSubmit={createUser}>
              <div className="grid gap-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label>Quyền</Label>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Đang tạo...' : 'Tạo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
