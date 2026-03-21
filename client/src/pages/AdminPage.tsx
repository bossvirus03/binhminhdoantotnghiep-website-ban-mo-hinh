import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/dashboard", label: "Tổng quan" },
  { to: "/admin/products", label: "Thêm sản phẩm" },
  { to: "/admin/taxonomies", label: "Brand & Danh mục" },
  { to: "/admin/orders", label: "Danh sách Đơn hàng" },
  { to: "/admin/users", label: "Danh sách Người dùng" },
];

function navItemClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition",
    isActive ? "bg-muted text-foreground" : "text-muted-foreground",
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const activeItem =
    navItems.find((item) => pathname.startsWith(item.to)) ?? navItems[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="rounded bg-primary/10 px-2 py-1 text-[11px] uppercase text-primary">
              Admin
            </span>
            LM Hobby Shop
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {user?.email && (
              <span className="hidden text-muted-foreground sm:inline">
                {user.email}
              </span>
            )}
            <Button asChild size="sm" variant="ghost">
              <Link to="/">Về trang mua hàng</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="self-start rounded-lg border bg-white shadow-sm">
            <div className="border-b px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
              Điều hướng
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navItemClass}
                  end={item.to === "/admin/dashboard"}
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">
                Trang quản trị
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {activeItem.label}
              </h1>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

// Alias giữ tên cũ để tránh ảnh hưởng nơi khác nếu có.
export const AdminPage = AdminLayout;
