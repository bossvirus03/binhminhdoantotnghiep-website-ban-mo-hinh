import * as React from "react";

import { cn } from "@/lib/utils";

export function RadioGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

export function RadioItem({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-accent",
        className,
      )}
      {...props}
    />
  );
}
