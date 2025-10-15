import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const APP_URL = process.env.APP_URL!;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const hmac = url.searchParams.get("hmac");

  // Verify state for CSRF protection
  const savedState = req.cookies.get("shopify_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 });
  }

  if (!shop || !code) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // Verify HMAC
  const params = new URLSearchParams(url.search);
  params.delete("hmac");
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
  
  const hash = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(sortedParams)
    .digest("hex");

  if (hash !== hmac) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 400 });
  }

  // Exchange code for access token
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        client_id: SHOPIFY_API_KEY, 
        client_secret: SHOPIFY_API_SECRET, 
        code 
      })
    });

    if (!tokenRes.ok) {
      throw new Error("Token exchange failed");
    }

    const data = await tokenRes.json() as { access_token: string; scope: string };
    
    // For session-based auth, we'll create a session cookie with shop info
    // In production, you might want to store this in a secure session store
    const res = NextResponse.redirect(`${APP_URL}/app?shop=${shop}`);
    res.cookies.set("shopify_session", JSON.stringify({ shop, token: data.access_token }), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    // Clear OAuth state cookies
    res.cookies.delete("shopify_oauth_state");
    res.cookies.delete("shopify_oauth_nonce");

    return res;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json({ error: "Failed to complete OAuth flow" }, { status: 500 });
  }
}
