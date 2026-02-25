import { useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/http';
import type { Brand, Category, Product } from '../types';
import { getCart, setCart } from '../lib/storage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

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

export function ProductsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [q, setQ] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [b, c] = await Promise.all([
        apiFetch<Brand[]>('/brands'),
        apiFetch<Category[]>('/categories'),
      ]);
      setBrands(b);
      setCategories(c);
    })().catch((e) => setError(e?.message ?? 'Failed to load filters'));
  }, []);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (brandId) sp.set('brandId', brandId);
    if (categoryId) sp.set('categoryId', categoryId);
    const s = sp.toString();
    return s ? `?${s}` : '';
  }, [q, brandId, categoryId]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      setError(null);
      const list = await apiFetch<Product[]>(`/products${queryString}`);
      setProducts(list);
      setPage(1);
      setLoading(false);
    })().catch((e) => {
      setError(e?.message ?? 'Failed to load products');
      setLoading(false);
    });
  }, [queryString]);

  function addToCart(p: Product) {
    const cart = getCart();
    const idx = cart.findIndex((i) => i.productId === p.id);
    const mainImage =
      (p.images && p.images.length ? p.images[0]?.url : p.imageUrl) ?? null;
    if (idx >= 0)
      cart[idx] = {
        ...cart[idx],
        quantity: cart[idx].quantity + 1,
        imageUrl: cart[idx].imageUrl ?? mainImage,
      };
    else
      cart.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: mainImage,
      });
    setCart(cart);
    setProducts((prev) => [...prev]);
    toast.success('Đã thêm vào giỏ hàng');
  }

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedProducts = products.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Xem/Tìm kiếm sản phẩm</h2>
        <p className="text-sm text-muted-foreground">
          Tìm theo tên, lọc theo brand và danh mục.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="q">Tìm kiếm</Label>
              <Input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm/lọc sản phẩm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Select
                id="brand"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">Tất cả brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          : pagedProducts.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <Link to={`/products/${p.id}`} className="block">
                  <div className="aspect-square w-full bg-muted">
                    <img
                      src={p.imageUrl ?? FALLBACK_IMAGE_URL}
                      alt={p.name}
                      loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={handleImageError}
                    />
                  </div>
                </Link>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base">
                    <Link to={`/products/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {p.brand?.name && <Badge variant="secondary">{p.brand.name}</Badge>}
                    {p.category?.name && <Badge variant="outline">{p.category.name}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Giá</span>: {formatMoney(p.price)}đ
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => addToCart(p)}>Thêm vào giỏ</Button>
                    <Button asChild variant="outline">
                      <Link to={`/products/${p.id}`}>Xem chi tiết</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-sm">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={safePage === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Trang trước
          </Button>
          <span className="text-muted-foreground">
            Trang {safePage}/{totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={safePage === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
