import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] motion-safe:transform-gpu [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [box-shadow:var(--shadow-2)] shadow-sky-200/50 hover:bg-sky-600 hover:[box-shadow:var(--shadow-3)]",
        destructive:
          "bg-rose-600 text-white [box-shadow:var(--shadow-2)] shadow-rose-200/50 hover:bg-rose-700 hover:[box-shadow:var(--shadow-3)]",
        success:
          "bg-emerald-600 text-white [box-shadow:var(--shadow-2)] shadow-emerald-200/50 hover:bg-emerald-700 hover:[box-shadow:var(--shadow-3)]",
        warning:
          "bg-amber-500 text-white [box-shadow:var(--shadow-2)] shadow-amber-200/50 hover:bg-amber-600 hover:[box-shadow:var(--shadow-3)]",
        outline:
          "border border-slate-200 bg-white text-slate-900 [box-shadow:var(--shadow-1)] hover:bg-slate-50 hover:border-slate-300",
        secondary:
          "bg-slate-100 text-slate-800 [box-shadow:var(--shadow-1)] hover:bg-slate-200",
        ghost:
          "text-slate-800 hover:bg-slate-100",
        "ghost-destructive":
          "text-rose-600 hover:bg-rose-50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
