import { ImageResponse } from "next/og";

// ImageResponse-based icon. Generated at build time, no external image needed.
// Square rounded brand icon with the "RM" mark.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #c2410c 0%, #9a3412 100%)",
          borderRadius: "8px",
          color: "white",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        RM
      </div>
    ),
    { ...size }
  );
}
