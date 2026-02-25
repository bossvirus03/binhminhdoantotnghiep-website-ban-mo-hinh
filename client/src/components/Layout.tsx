import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getCart, subscribeCartChange } from "../lib/storage";
import { TetLuckyMoneyRain } from "./TetLuckyMoneyRain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function navItemClass({ isActive }: { isActive: boolean }) {
  return cn("rounded-md", isActive && "bg-accent text-accent-foreground");
}

export function Layout() {
  const { user, token, logout } = useAuth();
  const [cartCount, setCartCount] = useState(() =>
    getCart().reduce((sum, i) => sum + i.quantity, 0),
  );

  useEffect(() => {
    return subscribeCartChange(() => {
      setCartCount(getCart().reduce((sum, i) => sum + i.quantity, 0));
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <TetLuckyMoneyRain />
      <div className="pointer-events-none absolute inset-0 -z-10 select-none">
        <div className="absolute -left-6 top-0 h-40 w-40 animate-bounce-slow">
          <div className="h-full w-full rounded-full bg-gradient-to-b from-red-500 to-yellow-400 opacity-70 shadow-[0_0_25px_rgba(248,113,113,0.8)]" />
        </div>
        <div className="absolute right-6 top-6 h-24 w-24 animate-pulse-slow">
          <div className="h-full w-full rounded-full border-2 border-yellow-300 bg-transparent shadow-[0_0_30px_rgba(250,204,21,0.9)]" />
        </div>
        <div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(248,250,252,0.15),_transparent_70%)]" />
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <img
              src="/6e3d832b-966e-422f-a1d0-f434468a1720.jpg"
              alt="Logo"
              className="h-10 w-10 object-contain rounded-full"
            />
            LM HOBBY SHOP
          </Link>

          <nav className="flex flex-1 flex-wrap items-center gap-1">
            <Button asChild variant="ghost">
              <NavLink to="/products" className={navItemClass}>
                Sản phẩm
              </NavLink>
            </Button>

            <Button asChild variant="ghost">
              <NavLink to="/cart" className={navItemClass}>
                <span className="flex items-center gap-2">
                  Giỏ hàng
                  <Badge variant="secondary">{cartCount}</Badge>
                </span>
              </NavLink>
            </Button>

            <Button asChild variant="ghost">
              <NavLink to="/checkout" className={navItemClass}>
                Thanh toán
              </NavLink>
            </Button>

            <Button asChild variant="ghost">
              <NavLink to="/contact" className={navItemClass}>
                Liên hệ
              </NavLink>
            </Button>

            <Button asChild variant="ghost">
              <NavLink to="/about" className={navItemClass}>
                Giới thiệu
              </NavLink>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            {token ? (
              <>
                {user?.role === "admin" && (
                  <Button asChild variant="ghost">
                    <NavLink to="/admin/dashboard" className={navItemClass}>
                      Quản trị
                    </NavLink>
                  </Button>
                )}
                <Button asChild variant="ghost">
                  <NavLink to="/account" className={navItemClass}>
                    {user?.email ?? "Tài khoản"}
                  </NavLink>
                </Button>
                <Button variant="outline" onClick={logout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <NavLink to="/login" className={navItemClass}>
                    Đăng nhập
                  </NavLink>
                </Button>
                <Button asChild>
                  <NavLink to="/register" className={navItemClass}>
                    Đăng ký
                  </NavLink>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 flex-1 min-h-0 w-full">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Separator className="mb-4" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* QR code cộng đồng Zalo */}
              <img
                src="/zalo-community-qr.png"
                alt="QR cộng đồng Zalo"
                className="w-24 h-24 rounded bg-white p-1 border"
              />
              <div>
                <div className="font-semibold">Tham gia cộng đồng Zalo:</div>
                <a
                  href="https://zalo.me/g/aevaqy084"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  zalo.me/g/aevaqy084
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
              >
                <img
                  src="/facebook-logo.png"
                  alt="Facebook"
                  className="w-8 h-8"
                />
              </a>
              {/* Shopee */}
              <a
                href="https://shopee.vn/"
                target="_blank"
                rel="noopener noreferrer"
                title="Shopee"
              >
                <img src="/shopee-logo.png" alt="Shopee" className="w-8 h-8" />
              </a>
              {/* Zalo */}
              <a
                href="https://zalo.me/"
                target="_blank"
                rel="noopener noreferrer"
                title="Zalo"
              >
                <img src="/zalo-logo.png" alt="Zalo" className="w-8 h-8" />
              </a>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-4">
            Demo đồ án • Website bán mô hình
          </div>
        </div>
      </footer>
    </div>
  );
}
