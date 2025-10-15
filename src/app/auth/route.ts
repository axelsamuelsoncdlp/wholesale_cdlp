import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const APP_URL = process.env.APP_URL!;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SCOPES = process.env.SCOPES!;

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  
  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  // Ensure shop is in myshopify.com format
  const shopDomain = shop.includes(".myshopify.com") ? shop : `${shop}.myshopify.com`;
  
  const redirectUri = `${APP_URL}/auth/callback`;
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
  authUrl.searchParams.set("client_id", SHOPIFY_API_KEY);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("shopify_oauth_state", state, { 
    httpOnly: true, 
    secure: true, 
    sameSite: "lax", 
    path: "/" 
  });
  res.cookies.set("shopify_oauth_nonce", nonce, { 
    httpOnly: true, 
    secure: true, 
    sameSite: "lax", 
    path: "/" 
  });
  
  return res;
}
