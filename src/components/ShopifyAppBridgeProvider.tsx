"use client";
import { createApp } from "@shopify/app-bridge";
import { AppProvider } from "@shopify/app-bridge-react";
import { ReactNode, useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ShopifyAppBridgeProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    // Initialize App Bridge for embedded apps
    const host = new URLSearchParams(window.location.search).get("host");
    if (host && process.env.NEXT_PUBLIC_SHOPIFY_API_KEY) {
      const appConfig = {
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
        host: host,
      };
      
      const appInstance = createApp(appConfig);
      setApp(appInstance);
      setConfig(appConfig);
    }
  }, []);

  if (!app || !config) {
    return <>{children}</>;
  }

  return (
    <AppProvider config={config}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  );
}
