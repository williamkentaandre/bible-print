import { ImageResponse } from "next/og";
import { breakVerseLines, quoteLines } from "@/lib/composition";

export const alt = "Bible Deco — Moi et ma maison, nous servirons l’Éternel. Josué 24:15";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const VERSE = "Moi et ma maison, nous servirons l'Éternel.";
const LINES = quoteLines(breakVerseLines(VERSE, "horizontal"));

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #faf6f0 0%, #f4efe7 42%, #ece4d8 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 1040,
            height: 520,
            background: "linear-gradient(155deg, #f4e6b8 0%, #d4b36a 28%, #a07a32 52%, #ead08a 78%, #b89040 100%)",
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              background: "#ffffff",
              padding: "18px 28px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                border: "1.5px solid #c6a14d",
                padding: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "100%",
                  border: "1px solid #c6a14d",
                  padding: "22px 36px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  {LINES.map((line) => (
                    <div
                      key={line}
                      style={{
                        display: "flex",
                        fontFamily: "Script",
                        fontSize: 52,
                        color: "#111111",
                        textAlign: "center",
                        lineHeight: 1.34,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    fontFamily: "Roman",
                    fontSize: 18,
                    color: "#111111",
                    letterSpacing: 0.3,
                  }}
                >
                  Josué 24:15
                </div>
              </div>
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
