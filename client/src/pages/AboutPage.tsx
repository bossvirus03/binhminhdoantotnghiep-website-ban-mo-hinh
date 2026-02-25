import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Về chúng tôi</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Chúng tôi là nền tảng chuyên cung cấp các sản phẩm mô hình chất
            lượng, được tuyển chọn kỹ lưỡng với nhiều chủ đề và phong cách khác
            nhau.
          </p>

          <p>
            Với giao diện thân thiện và quy trình mua sắm đơn giản, khách hàng
            có thể dễ dàng khám phá sản phẩm, đặt hàng và thanh toán một cách
            nhanh chóng, an toàn.
          </p>

          <p>
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tiện lợi, dịch vụ hỗ
            trợ tận tâm và sản phẩm đúng như mô tả, đáp ứng nhu cầu sưu tầm và
            trưng bày của khách hàng.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
