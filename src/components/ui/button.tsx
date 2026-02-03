import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-an",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // AN (Assemblée Nationale) specific variants
        an: "bg-an text-white hover:bg-an-dark shadow-an hover:shadow-an-lg",
        "an-outline": "border-2 border-an text-an hover:bg-an hover:text-white",
        "an-ghost": "text-an hover:bg-an/10",
        // Legacy government variants (remapped to AN style)
        government: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-an",
        gold: "bg-an text-white font-semibold hover:bg-an-dark shadow-an-glow hover:shadow-an-lg",
        success: "bg-success text-white hover:bg-success/90",
        // Hero variants
        hero: "bg-an text-white font-semibold text-base px-8 py-3 hover:bg-an-dark shadow-an-glow hover:shadow-an-lg transition-all duration-300 hover:scale-[1.02]",
        "hero-outline": "border-2 border-white/30 text-white font-medium hover:bg-white/10 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
