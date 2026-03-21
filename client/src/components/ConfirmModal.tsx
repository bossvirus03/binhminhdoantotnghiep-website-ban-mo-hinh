import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmVariant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent />
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xử lý..." : confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
