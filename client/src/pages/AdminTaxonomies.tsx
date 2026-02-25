import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/http';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';

interface Taxonomy {
  id: string;
  name: string;
}

export function AdminTaxonomies() {
  const { token } = useAuth();
  const [brands, setBrands] = useState<Taxonomy[] | null>(null);
  const [categories, setCategories] = useState<Taxonomy[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [brandName, setBrandName] = useState('');
  const [brandEditing, setBrandEditing] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryEditing, setCategoryEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const [b, c] = await Promise.all([
        apiFetch<Taxonomy[]>('/admin/brands', { token }),
        apiFetch<Taxonomy[]>('/admin/categories', { token }),
      ]);
      setBrands(b);
      setCategories(c);
    } catch {
      toast.error('Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function saveBrand() {
    if (!token || !brandName.trim()) return;
    setSaving(true);
    try {
      if (brandEditing) {
        await apiFetch(`/admin/brands/${brandEditing}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ name: brandName.trim() }),
        });
        toast.success('Đã cập nhật brand');
      } else {
        await apiFetch('/admin/brands', {
          method: 'POST',
          token,
          body: JSON.stringify({ name: brandName.trim() }),
        });
        toast.success('Đã thêm brand');
      }
      setBrandName('');
      setBrandEditing(null);
      load();
    } catch {
      toast.error('Lỗi lưu brand');
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory() {
    if (!token || !categoryName.trim()) return;
    setSaving(true);
    try {
      if (categoryEditing) {
        await apiFetch(`/admin/categories/${categoryEditing}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ name: categoryName.trim() }),
        });
        toast.success('Đã cập nhật danh mục');
      } else {
        await apiFetch('/admin/categories', {
          method: 'POST',
          token,
          body: JSON.stringify({ name: categoryName.trim() }),
        });
        toast.success('Đã thêm danh mục');
      }
      setCategoryName('');
      setCategoryEditing(null);
      load();
    } catch {
      toast.error('Lỗi lưu danh mục');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBrand(id: string) {
    if (!token) return;
    if (!confirm('Xóa brand này?')) return;
    try {
      await apiFetch(`/admin/brands/${id}`, { method: 'DELETE', token });
      toast.success('Đã xóa brand');
      setBrands((prev) => prev?.filter((b) => b.id !== id) ?? prev);
      if (brandEditing === id) {
        setBrandEditing(null);
        setBrandName('');
      }
    } catch {
      toast.error('Lỗi xóa brand');
    }
  }

  async function deleteCategory(id: string) {
    if (!token) return;
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE', token });
      toast.success('Đã xóa danh mục');
      setCategories((prev) => prev?.filter((c) => c.id !== id) ?? prev);
      if (categoryEditing === id) {
        setCategoryEditing(null);
        setCategoryName('');
      }
    } catch {
      toast.error('Lỗi xóa danh mục');
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Quản lý</p>
              <CardTitle className="text-lg">Brand</CardTitle>
            </div>
            <div className="flex gap-2">
              {brandEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setBrandEditing(null);
                    setBrandName('');
                  }}
                >
                  Hủy sửa
                </Button>
              )}
              <Button size="sm" onClick={saveBrand} disabled={saving || !brandName.trim()}>
                {brandEditing ? 'Lưu' : 'Thêm'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Tên brand"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            {loading || !brands ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {brands.length === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa có brand.</p>
                )}
                {brands.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{b.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBrandEditing(b.id);
                          setBrandName(b.name);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteBrand(b.id)}>
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Quản lý</p>
              <CardTitle className="text-lg">Danh mục</CardTitle>
            </div>
            <div className="flex gap-2">
              {categoryEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCategoryEditing(null);
                    setCategoryName('');
                  }}
                >
                  Hủy sửa
                </Button>
              )}
              <Button
                size="sm"
                onClick={saveCategory}
                disabled={saving || !categoryName.trim()}
              >
                {categoryEditing ? 'Lưu' : 'Thêm'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Tên danh mục"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            {loading || !categories ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa có danh mục.</p>
                )}
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{c.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCategoryEditing(c.id);
                          setCategoryName(c.name);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCategory(c.id)}>
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
