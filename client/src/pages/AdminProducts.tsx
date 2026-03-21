import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/http';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  price: number;
  brandId: string;
  categoryId: string;
  imageUrl?: string;
  description?: string;
  brand?: { name: string };
  category?: { name: string };
  images?: { id: string; url: string }[];
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [form, setForm] = useState({
    name: '',
    price: '',
    brandId: '',
    categoryId: '',
    imageUrls: [''],
    description: '',
  });

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const [prodList, brandList, categoryList] = await Promise.all([
        apiFetch<Product[]>('/admin/products', { token }),
        apiFetch<Brand[]>('/brands'),
        apiFetch<Category[]>('/categories'),
      ]);
      setProducts(prodList);
      setBrands(brandList);
      setCategories(categoryList);
    } catch {
      toast.error('Lỗi tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function openCreateForm() {
    setEditing(null);
    setForm({
      name: '',
      price: '',
      brandId: brands[0]?.id ?? '',
      categoryId: categories[0]?.id ?? '',
      imageUrls: [''],
      description: '',
    });
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditing(product);
    const urlsFromImages = product.images?.map((img) => img.url) ?? [];
    const initialUrls = urlsFromImages.length
      ? urlsFromImages
      : product.imageUrl
        ? [product.imageUrl]
        : [''];
    setForm({
      name: product.name,
      price: product.price.toString(),
      brandId: product.brandId,
      categoryId: product.categoryId,
      imageUrls: initialUrls,
      description: product.description ?? '',
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error('Giá không hợp lệ');
      return;
    }
    if (!form.name || !form.brandId || !form.categoryId) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const imageUrls = form.imageUrls.map((u) => u.trim()).filter((u) => u.length > 0);

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price,
        brandId: form.brandId,
        categoryId: form.categoryId,
        imageUrls,
        description: form.description || undefined,
      };

      if (editing) {
        await apiFetch(`/admin/products/${editing.id}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(payload),
        });
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await apiFetch('/admin/products', {
          method: 'POST',
          token,
          body: JSON.stringify(payload),
        });
        toast.success('Đã thêm sản phẩm');
      }

      closeForm();
      load();
    } catch {
      toast.error(editing ? 'Lỗi cập nhật sản phẩm' : 'Lỗi thêm sản phẩm');
    } finally {
      setSaving(false);
    }
  }

  function requestRemoveProduct(product: Product) {
    setPendingDeleteProduct(product);
  }

  async function confirmRemoveProduct() {
    if (!token || !pendingDeleteProduct) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/admin/products/${pendingDeleteProduct.id}`, {
        method: 'DELETE',
        token,
      });
      toast.success('Đã xóa sản phẩm');
      setProducts((prev) =>
        prev ? prev.filter((p) => p.id !== pendingDeleteProduct.id) : prev,
      );
      setPendingDeleteProduct(null);
    } catch {
      toast.error('Lỗi xóa sản phẩm');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg">Quản lý sản phẩm</CardTitle>
          <Button size="sm" onClick={openCreateForm}>
            Thêm sản phẩm
          </Button>
        </CardHeader>
        <CardContent>
          {formOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-xl mx-4 rounded-md bg-background shadow-lg">
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <h2 className="text-base font-semibold">
                    {editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                  </h2>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-xl leading-none hover:text-destructive"
                    aria-label="Đóng"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tên sản phẩm</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Giá (VNĐ)</label>
                    <Input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Brand</label>
                    <Select
                      value={form.brandId}
                      onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        Chọn brand
                      </option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Danh mục</label>
                    <Select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        Chọn danh mục
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="mb-1 block text-sm font-medium">Ảnh (URL)</label>
                    {form.imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const next = [...form.imageUrls];
                            next[index] = e.target.value;
                            setForm({ ...form, imageUrls: next });
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const next = form.imageUrls.filter((_, i) => i !== index);
                            setForm({ ...form, imageUrls: next.length ? next : [''] });
                          }}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm({ ...form, imageUrls: [...form.imageUrls, ''] })}
                    >
                      + Thêm ảnh
                    </Button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Mô tả</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm border">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Sản phẩm</th>
                  <th className="p-2 text-right">Giá</th>
                  <th className="p-2">Brand</th>
                  <th className="p-2">Danh mục</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {products && (() => {
                  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
                  const safePage = Math.min(page, totalPages);
                  const startIndex = (safePage - 1) * pageSize;
                  const pageProducts = products.slice(startIndex, startIndex + pageSize);
                  return pageProducts.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                          <img
                            src={p.images && p.images.length ? p.images[0]?.url : p.imageUrl}
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="font-medium line-clamp-2">{p.name}</div>
                      </div>
                    </td>
                    <td className="p-2 text-right">{p.price.toLocaleString('vi-VN')}đ</td>
                    <td className="p-2">{p.brand?.name || <Badge variant="outline">-</Badge>}</td>
                    <td className="p-2">{p.category?.name || <Badge variant="outline">-</Badge>}</td>
                    <td className="p-2 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditForm(p)}>
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => requestRemoveProduct(p)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ));
                })()}
              </tbody>
            </table>
            {products && products.length > pageSize && (
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
                  Trang {page}/{Math.max(1, Math.ceil(products.length / pageSize))}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page >= Math.ceil(products.length / pageSize)}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(Math.max(1, Math.ceil(products.length / pageSize)), prev + 1),
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
        open={pendingDeleteProduct !== null}
        title="Xóa sản phẩm"
        description={
          pendingDeleteProduct
            ? `Bạn chắc chắn muốn xóa sản phẩm "${pendingDeleteProduct.name}"? Hành động này không thể hoàn tác.`
            : undefined
        }
        confirmText="Xóa"
        confirmVariant="destructive"
        loading={deleteLoading}
        onCancel={() => setPendingDeleteProduct(null)}
        onConfirm={confirmRemoveProduct}
      />
    </>
  );
}
