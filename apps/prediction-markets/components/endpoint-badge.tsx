"use client";

import { useEndpoints } from "@/components/endpoint-toggle";
import { useTour } from "@/components/guided-tour";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400",
  POST: "bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400",
  DELETE: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400",
};

interface EndpointBadgeProps {
  number: number;
  method: string;
  path: string;
  description?: string;
  /** Only render when the guided tour is active (not when the endpoints toggle is on). Use for fallback badges in loading/empty states. */
  tourOnly?: boolean;
}

export function EndpointBadge({ number, method, path, description, tourOnly }: EndpointBadgeProps) {
  const { showEndpoints } = useEndpoints();
  const { isActive } = useTour();

  if (tourOnly && !isActive) return null;
  if (!tourOnly && !showEndpoints && !isActive) return null;

  const colors = METHOD_COLORS[method] ?? "bg-gray-500/15 text-gray-600 border-gray-500/30";

  const badge = (
    <span
      data-tour-step={number}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] leading-tight whitespace-nowrap",
        colors
      )}
    >
      <span className="font-bold">#{number}</span>
      <span className="font-semibold">{method}</span>
      <span className="opacity-70">{path}</span>
    </span>
  );

  if (description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="max-w-xs text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}
