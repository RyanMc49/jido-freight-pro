import { type ReactNode } from "react";

interface TooltipProviderProps { children: ReactNode; delayDuration?: number }
export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}
