import React from "react";
import Snowfall from "react-snowfall";

// Dùng 1 hình bao lì xì chung cho hiệu ứng rơi
const ENVELOPE_URL =
  "https://bizweb.dktcdn.net/thumb/large/100/448/880/products/cay-mai-trang-no-hoa-69-b9ea73ff-20df-4cc2-b760-ba4adac9b320.png";

export const TetLuckyMoneyRain: React.FC = () => {
  const [images, setImages] = React.useState<HTMLImageElement[] | null>(null);

  React.useEffect(() => {
    const img = new Image();
    img.src = ENVELOPE_URL;
    img.onload = () => setImages([img]);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <Snowfall
        images={images ?? undefined}
        color="rgba(248, 113, 113, 0.9)"
        snowflakeCount={120}
        radius={[2, 5]}
        speed={[0.7, 1.8]}
        wind={[-0.8, 0.8]}
      />
    </div>
  );
};
