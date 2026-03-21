import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/http';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import type { User } from '../types';

export function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  function requestRemoveUser(user: User) {
    setPendingDeleteUser(user);
  }

  async function confirmRemoveUser() {
    if (!token || !pendingDeleteUser) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/admin/users/${pendingDeleteUser.id}`, { method: 'DELETE', token });
      toast.success('Đã xóa người dùng');
      setPendingDeleteUser(null);
      load();
    } catch {
      toast.error('Lỗi xóa người dùng');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quản lý người dùng</CardTitle>
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
                          onClick={() => requestRemoveUser(u)}
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
      </Card>
      <ConfirmModal
        open={pendingDeleteUser !== null}
        title="Xóa người dùng"
        description={
          pendingDeleteUser
            ? `Bạn chắc chắn muốn xóa người dùng ${pendingDeleteUser.email}? Hành động này không thể hoàn tác.`
            : undefined
        }
        confirmText="Xóa"
        confirmVariant="destructive"
        loading={deleteLoading}
        onCancel={() => setPendingDeleteUser(null)}
        onConfirm={confirmRemoveUser}
      />
    </>
  );
}
