import { ImageResponse } from "next/og";
import { breakVerseLines, quoteLines } from "@/lib/composition";

export const alt =
  "Bible Deco — Josué 24:15 et Jean 3:16, accrochés au mur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const JOSHUA = "Moi et ma maison, nous servirons l'Éternel.";
const JOHN =
  "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.";

type Tableau = {
  lines: string[];
  reference: string;
  fontSize: number;
};

const TABLEAUX: Tableau[] = [
  {
    lines: quoteLines(breakVerseLines(JOSHUA, "vertical")),
    reference: "Josué 24:15",
    fontSize: 44,
  },
  {
    lines: quoteLines(breakVerseLines(JOHN, "vertical")),
    reference: "Jean 3:16",
    fontSize: 22,
  },
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
          gap: 36,
          background: "linear-gradient(180deg, #e7dfd2 0%, #d8cfc0 55%, #cfc4b3 100%)",
        }}
      >
        {TABLEAUX.map((tableau) => (
          <div
            key={tableau.reference}
            style={{
              display: "flex",
              flexDirection: "column",
              width: 390,
              height: 546,
              background:
                "linear-gradient(155deg, #f4e6b8 0%, #d4b36a 28%, #a07a32 52%, #ead08a 78%, #b89040 100%)",
              padding: 11,
              boxShadow: "0 18px 36px rgba(42, 28, 14, 0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                background: "#ffffff",
                padding: "10px 12px 8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "100%",
                  border: "1.5px solid #c6a14d",
                  padding: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    border: "1px solid #c6a14d",
                    padding: "10px 12px 8px",
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
                    {tableau.lines.map((line) => (
                      <div
                        key={line}
                        style={{
                          display: "flex",
                          fontFamily: "Script",
                          fontSize: tableau.fontSize,
                          color: "#111111",
                          textAlign: "center",
                          lineHeight: 1.2,
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
                      fontSize: 15,
                      color: "#111111",
                    }}
                  >
                    {tableau.reference}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
