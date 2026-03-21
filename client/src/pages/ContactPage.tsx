import { useState } from "react";
import { apiFetch } from "../api/http";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      await apiFetch<{ ok: boolean }>("/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, message }),
      });
      setInfo("Đã gửi liên hệ.");
      setMessage("");
    } catch (err: any) {
      setError(err?.message ?? "Gửi liên hệ thất bại");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Liên hệ/Góp ý</h2>
        <p className="text-sm text-muted-foreground">
          Bạn có thể gửi mail/SĐT hỗ trợ và nội dung góp ý
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gửi liên hệ</CardTitle>
          <CardDescription>
            Trường có thể để trống, trừ nội dung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Tên (tuỳ chọn)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email (tuỳ chọn)</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">SĐT (tuỳ chọn)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="message">Nội dung</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nội dung"
                rows={5}
              />
            </div>
            <Button type="submit" disabled={!message.trim()}>
              Gửi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
