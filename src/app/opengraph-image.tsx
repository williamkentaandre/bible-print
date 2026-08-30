import { ImageResponse } from "next/og";

export const alt = "Bible Deco - le verset que vous aimez, accroché chez vous.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const id = "premium-jean-v1";

const LINES = [
  "« Car Dieu a tant aimé le monde",
  "qu'il a donné son Fils unique. »",
];

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
          background: "linear-gradient(180deg, #3d342a 0%, #241e18 52%, #161310 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 320,
            display: "flex",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(212, 179, 106, 0.28) 0%, transparent 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 42,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Roman",
              fontSize: 18,
              letterSpacing: 11,
              color: "#e4c57a",
            }}
          >
            BIBLE DECO
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 980,
            height: 468,
            padding: 13,
            background:
              "linear-gradient(155deg, #f6e8bc 0%, #d4b36a 26%, #8f6c2c 50%, #ead08a 76%, #b89040 100%)",
            boxShadow: "0 30px 70px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              background: "linear-gradient(180deg, #fffdf8 0%, #fffcf6 58%, #f4ead6 100%)",
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
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
                  padding: "28px 40px 22px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {LINES.map((line) => (
                    <div
                      key={line}
                      style={{
                        display: "flex",
                        fontFamily: "Script",
                        fontSize: 62,
                        color: "#1a1612",
                        lineHeight: 1.18,
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
                    fontFamily: "Roman",
                    fontSize: 20,
                    letterSpacing: 1,
                    color: "#2a241c",
                  }}
                >
                  Jean 3:16
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
