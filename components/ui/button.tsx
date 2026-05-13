import { cn } from "@/lib/utils";
import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "sm" | "default" | "icon";
  children: ReactNode;
}

export function Button({ variant = "default", size = "default", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors rounded-lg",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" && "bg-accent text-accent-foreground hover:bg-accent/90",
        variant === "ghost" && "hover:bg-muted",
        variant === "outline" && "border border-border hover:bg-muted",
        variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        size === "sm" && "text-xs px-2 py-1",
        size === "default" && "text-sm px-4 py-2",
        size === "icon" && "p-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
