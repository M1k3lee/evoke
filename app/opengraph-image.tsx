import { ImageResponse } from "next/og";

// dynamic OG image — rendered server-side by next/og.
// no asset file needed; this IS the asset. matches brand at all sizes
// social platforms request (twitter, linkedin, discord, slack, imessage).

export const runtime = "edge";
export const alt = "EVOKE — AI Personality Builder Without the Sliders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "#050505",
          color: "#e5e5e5",
          fontFamily: "monospace",
        }}
      >
        {/* top stamp */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, background: "#00FF66" }} />
          <div
            style={{
              color: "#00FF66",
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            v0.1 — consciousness incubator online
          </div>
        </div>

        {/* main mark */}
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.9 }}>
          <div
            style={{
              fontSize: 200,
              fontWeight: 900,
              letterSpacing: -10,
              textTransform: "uppercase",
              color: "#fafafa",
            }}
          >
            EVOKE
          </div>
          <div
            style={{
              fontSize: 130,
              fontWeight: 900,
              letterSpacing: -8,
              textTransform: "uppercase",
              color: "#00FF66",
              marginTop: -20,
            }}
          >
            CONSCIOUSNESS.
          </div>
        </div>

        {/* tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 40,
            borderTop: "1px solid #262626",
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 26, color: "#a3a3a3", lineHeight: 1.35 }}>
            &gt; nine-phase psychological interrogation. compiles a soul.md system prompt in your own voice.
          </div>
          <div style={{ fontSize: 18, color: "#525252", letterSpacing: 4, whiteSpace: "nowrap" }}>
            EVOKE.AI
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
