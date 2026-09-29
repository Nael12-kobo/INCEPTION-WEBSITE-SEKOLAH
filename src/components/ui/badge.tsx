import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-slate-100 text-slate-700",
        outline:
          "border-slate-200 bg-white text-slate-700",
        destructive:
          "border-transparent bg-rose-50 text-rose-700",
        success:
          "border-transparent bg-emerald-50 text-emerald-700",
        warning:
          "border-transparent bg-amber-50 text-amber-700",
        info:
          "border-transparent bg-sky-50 text-sky-700",
        violet:
          "border-transparent bg-violet-50 text-violet-700",
        "status-pending":
          "border-amber-200 bg-amber-50 text-amber-700 [&_span.status-dot]:bg-amber-500",
        "status-contacted":
          "border-sky-200 bg-sky-50 text-sky-700 [&_span.status-dot]:bg-sky-500",
        "status-registered":
          "border-emerald-200 bg-emerald-50 text-emerald-700 [&_span.status-dot]:bg-emerald-500",
        "status-rejected":
          "border-rose-200 bg-rose-50 text-rose-700 [&_span.status-dot]:bg-rose-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

function StatusBadge({
  status,
  children,
  className,
  ...props
}: {
  status: "PENDING" | "CONTACTED" | "REGISTERED" | "REJECTED" | string;
  children?: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
  const map: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
    PENDING: "status-pending",
    CONTACTED: "status-contacted",
    REGISTERED: "status-registered",
    REJECTED: "status-rejected",
  };
  const variant = map[status] ?? "secondary";
  const label = children ?? status;
  return (
    <Badge
      variant={variant}
      className={cn(className)}
      {...props}
    >
      <span className="status-dot relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" />
      </span>
      {label}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };
