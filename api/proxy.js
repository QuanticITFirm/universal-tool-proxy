
import { NextRequest, NextResponse } from "next/server";
import { request } from "follow-redirects";
import { parse } from "url";

export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const rawMode = searchParams.get("raw") === "true";

  if (!targetUrl) {
    return new Response("Missing ?url parameter", { status: 400 });
  }

  return new Promise((resolve, reject) => {
    const options = {
      ...parse(targetUrl),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    };

    const reqRedirect = request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (rawMode) {
          resolve(
            new Response(
              JSON.stringify({
                finalUrl: res.responseUrl || targetUrl,
                status: res.statusCode,
                html: data
              }),
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                }
              }
            )
          );
        } else {
          resolve(
            new Response(data, {
              status: 200,
              headers: {
                "Content-Type": "text/html",
                "Access-Control-Allow-Origin": "*"
              }
            })
          );
        }
      });
    });

    reqRedirect.on("error", (err) => {
      resolve(new Response("Proxy Error: " + err.message, { status: 500 }));
    });

    reqRedirect.end();
  });
}
