import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockApi } from "../services/mockApi";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [boot, setBoot] = useState(null);
  const [screen, setScreen] = useState("home");
  const [stack, setStack] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    mockApi.getBootstrap().then(setBoot);
  }, []);

  const actions = useMemo(() => ({
    navigate: key => { setStack(null); setScreen(key); },
    open: key => setStack(key),
    close: () => setStack(null),
    scan: async value => {
      const result = await mockApi.scan(value);
      setScanResult(result);
      setScreen("scan");
    },
    activate: async payload => {
      const result = await mockApi.activateByClaimId(payload);
      const latestTags = await mockApi.getTags();
      setBoot(current => ({ ...current, tags: latestTags }));
      return result;
    },
    generateTags: async payload => {
      const result = await mockApi.generateAdminTags(payload);
      const latestTags = await mockApi.getTags();
      setBoot(current => ({ ...current, tags: latestTags }));
      return result;
    },
    setVisibility: async updates => {
      const result = await mockApi.setModuleVisibility(updates);
      setBoot(current => ({ ...current, moduleVisibility: result.moduleVisibility }));
      return result;
    },
    designQr: mockApi.designQr
  }), []);

  return <AppContext.Provider value={{ boot, screen, stack, scanResult, actions }}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useAppStore must be used inside AppProvider");
  return value;
}
