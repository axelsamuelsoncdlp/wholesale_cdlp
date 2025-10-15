"use client";
import { createApp } from "@shopify/app-bridge";
import { ReactNode, useEffect } from "react";

export default function ShopifyAppBridgeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize App Bridge for embedded apps
    const host = new URLSearchParams(window.location.search).get("host");
    if (host && process.env.NEXT_PUBLIC_SHOPIFY_API_KEY) {
      const app = createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
        host: host,
      });
      
      // App Bridge is now initialized globally
      // The session token will be available for API calls
    }
  }, []);

  return <>{children}</>;
}
