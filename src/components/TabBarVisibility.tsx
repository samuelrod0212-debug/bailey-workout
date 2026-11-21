// Screens that open a full-screen sheet hide the tab bar while it's up
// (react-native-web gives every View its own stacking context, so zIndex alone can't lift a sheet above it).
import React, { createContext, useContext, useEffect } from 'react';

export const HideTabBarCtx = createContext<(hide: boolean) => void>(() => {});
export function useHideTabBar(hide: boolean) {
  const set = useContext(HideTabBarCtx);
  useEffect(() => { set(hide); return () => set(false); }, [hide]);
}
