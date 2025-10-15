"use client";
import { Provider } from "@shopify/app-bridge-react";
import { ReactNode } from "react";

export default function ShopifyAppBridgeProvider({ children }: { children: ReactNode }) {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
    host: new URLSearchParams(window.location.search).get("host") || "",
  };
  
  return <Provider config={config}>{children}</Provider>;
}
