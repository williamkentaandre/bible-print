import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

async function loadRoman() {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500&display=swap",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0",
      },
    },
  ).then((response) => response.text());
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) {
    throw new Error("Police introuvable.");
  }
  return fetch(match[1]).then((response) => response.arrayBuffer());
}

export default async function Icon() {
  const roman = await loadRoman();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          padding: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "7px solid #c6a14d",
            padding: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              border: "3px solid #c6a14d",
              fontFamily: "Roman",
              fontSize: 168,
              color: "#2a241c",
              letterSpacing: 2,
            }}
          >
            BD
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Roman", data: roman, weight: 500, style: "normal" }],
    },
  );
}
