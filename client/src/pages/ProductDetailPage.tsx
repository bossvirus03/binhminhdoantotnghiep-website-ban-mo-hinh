import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/http';
import type { Product } from '../types';
import { getCart, setCart } from '../lib/storage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

function ProductImagesGallery({ product }: { product: Product }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const images =
    (product.images && product.images.length
      ? product.images.map((img) => img.url)
      : product.imageUrl
        ? [product.imageUrl]
        : []) || [];

  const main = images[selectedIndex] ?? images[0] ?? FALLBACK_IMAGE_URL;

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
        <img
          src={main}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded border bg-muted transition hover:opacity-100 ${
                idx === selectedIndex
                  ? 'ring-2 ring-primary opacity-100'
                  : 'opacity-70 hover:opacity-90'
              }`}
            >
              <img
                src={url}
                alt={`${product.name} ${idx + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setError(null);
      const p = await apiFetch<Product>(`/products/${id}`);
      setProduct(p);
      const r = await apiFetch<Product[]>(`/products/${id}/related`);
      setRelated(r.filter((x) => x.id !== id));
    })().catch((e) => setError(e?.message ?? 'Failed to load product'));
  }, [id]);

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
    toast.success('Đã thêm vào giỏ hàng');
  }

  if (!id) return <div>Missing product id</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link to="/products">← Quay lại</Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Xem chi tiết sản phẩm</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!product ? (
        <div className="text-sm text-muted-foreground">Đang tải chi tiết sản phẩm...</div>
      ) : (
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">{product.name}</CardTitle>
            <div className="flex flex-wrap gap-2 text-sm">
              {product.brand?.name && <Badge variant="secondary">{product.brand.name}</Badge>}
              {product.category?.name && <Badge variant="outline">{product.category.name}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 md:flex md:gap-8 md:space-y-0">
            <div className="md:w-1/2">
              <ProductImagesGallery product={product} />
            </div>

            <div className="space-y-5 md:w-1/2">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Giá</div>
                <div className="text-2xl font-bold text-primary">
                  {formatMoney(product.price)}đ
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Mô tả sản phẩm</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {product.brand?.name && (
                  <div>
                    <span className="font-medium text-foreground">Thương hiệu:</span>{' '}
                    {product.brand.name}
                  </div>
                )}
                {product.category?.name && (
                  <div>
                    <span className="font-medium text-foreground">Danh mục:</span>{' '}
                    {product.category.name}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button className="w-full sm:w-auto" onClick={() => addToCart(product)}>
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-2">
        <h3 className="text-lg font-semibold">Các sản phẩm liên quan</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <Card
              key={p.id}
              className="group overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
            >
              <Link to={`/products/${p.id}`} className="block">
                <div className="aspect-square w-full bg-muted overflow-hidden">
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
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Giá</span>: {formatMoney(p.price)}đ
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => addToCart(p)} size="sm">
                    Thêm vào giỏ
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/products/${p.id}`}>Xem</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
