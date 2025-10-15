"use client";
import { createApp } from "@shopify/app-bridge";
import { ReactNode, useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

interface AppConfig {
  apiKey: string;
  host: string;
}

export default function ShopifyAppBridgeProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<ReturnType<typeof createApp> | null>(null)
  const [config, setConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    // Initialize App Bridge for embedded apps
    const host = new URLSearchParams(window.location.search).get("host");
    if (host && process.env.NEXT_PUBLIC_SHOPIFY_API_KEY) {
      const appConfig: AppConfig = {
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
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
