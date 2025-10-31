"use client";

import { Provider } from "react-redux";
import { SessionProvider, useSession } from "next-auth/react";
import { store } from "@/redux/store";
import api from "@/lib/axios";
import { useEffect } from "react";

function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.accessToken) {
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${session.user.accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <SessionSync />
        {children}
      </Provider>
    </SessionProvider>
  );
}
