import { ImageResponse } from "next/og";

export const alt = "Bible Print — Votre verset, au mur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0",
      },
    },
  ).then((response) => response.text());
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Police introuvable : ${family}`);
  }
  return fetch(match[1]).then((response) => response.arrayBuffer());
}

export default async function Image() {
  const [roman, script] = await Promise.all([
    loadFont("EB Garamond", 500),
    loadFont("Great Vibes", 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #faf6f0 0%, #f4efe7 42%, #ece4d8 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 1040,
            height: 510,
            padding: 8,
            border: "2px solid #c6a14d",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "#fffcf7",
              border: "1px solid #c6a14d",
              padding: "56px 72px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Roman",
                fontSize: 26,
                letterSpacing: 10,
                color: "#8a6a3e",
              }}
            >
              BIBLE PRINT
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 36,
                fontFamily: "Script",
                fontSize: 58,
                lineHeight: 1.25,
                textAlign: "center",
                color: "#2a241c",
              }}
            >
              Moi et ma maison, nous servirons l’Éternel.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 32,
                fontFamily: "Roman",
                fontSize: 24,
                color: "#6d655a",
              }}
            >
              Josué 24:15
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Roman", data: roman, weight: 500, style: "normal" },
        { name: "Script", data: script, weight: 400, style: "normal" },
      ],
    },
  );
}
