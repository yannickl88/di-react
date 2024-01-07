import { RegistryToken } from "./types";
import { createContext, useContext, useMemo } from "react";
import { Container } from "./container";

export const ContainerContext = createContext(new Container());

export function useInject<T>(token: RegistryToken<T>): T {
  const container = useContext(ContainerContext);

  return useMemo(() => container.get(token), [token]);
}
