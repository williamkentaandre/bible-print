import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

async function loadScript() {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap",
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
  const script = await loadScript();

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
          padding: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "4px solid #c6a14d",
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
              border: "2px solid #c6a14d",
              fontFamily: "Script",
              fontSize: 220,
              color: "#111111",
            }}
          >
            B
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Script", data: script, weight: 400, style: "normal" }],
    },
  );
}
