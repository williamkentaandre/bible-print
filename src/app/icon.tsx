import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4efe7",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 400,
            height: 400,
            padding: 10,
            border: "6px solid #c6a14d",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "#fffcf7",
              border: "3px solid #c6a14d",
              color: "#8a6a3e",
              fontSize: 168,
              fontFamily: "Georgia, serif",
            }}
          >
            B
          </div>
        </div>
      </div>
    ),
    size,
  );
}
