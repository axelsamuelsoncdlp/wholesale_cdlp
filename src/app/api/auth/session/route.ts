import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      token, 
      new TextEncoder().encode(SHOPIFY_API_SECRET)
    );
    
    // Extract shop from JWT payload
    const shop = payload.dest?.toString().replace("https://", "");
    
    return NextResponse.json({ 
      valid: true, 
      shop,
      sessionToken: token 
    });
  } catch {
    return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
  }
}
