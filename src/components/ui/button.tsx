import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium",
    "rounded-xl transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "relative overflow-hidden",
          "bg-gradient-brand text-primary-foreground",
          "border border-white/20",
          "shadow-[var(--shadow-glow)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,transparent_45%)]",
          "before:pointer-events-none",
          "hover:brightness-105 hover:shadow-[0_16px_44px_-8px_color-mix(in_srgb,var(--primary)_50%,transparent)]",
          "active:scale-[0.97]",
        ].join(" "),
        destructive:
          "bg-destructive/12 text-destructive border border-destructive/22 hover:bg-destructive/20 hover:border-destructive/40 active:scale-[0.97]",
        outline:
          "glass-input border text-foreground hover:bg-white/[0.07] hover:border-white/14 active:scale-[0.97]",
        secondary:
          "bg-secondary text-secondary-foreground border border-white/[0.07] hover:bg-white/10 active:scale-[0.97]",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-white/[0.06] hover:text-foreground active:scale-[0.97]",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
        xs: "h-7 px-2.5 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
