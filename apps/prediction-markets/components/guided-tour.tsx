"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getEvents } from "@/lib/api";
import { METHOD_COLORS } from "@/components/endpoint-badge";
import { cn } from "@/lib/utils";

// ─── Tour Step Definitions (chronological user journey) ────────────────────────

interface TourStep {
  number: number;
  method: string;
  path: string;
  page: string;
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
  // ── Discover (1–4) ──
  { number: 1, method: "GET", path: "/events", page: "/discover", title: "Event Grid", description: "Fetches all prediction events. Supports category, status, and trending filters plus sort options." },
  { number: 2, method: "GET", path: "/events/search", page: "/discover", title: "Search Events", description: "Full-text search across event titles and metadata. The UI debounces input by 300 ms before calling." },
  { number: 3, method: "GET", path: "/events/suggested/{pubkey}", page: "/discover", title: "Suggested Events", description: "Personalized recommendations based on the connected wallet's trading history." },
  { number: 4, method: "GET", path: "/trading-status", page: "/discover", title: "Trading Status", description: "Polls whether the platform's trading engine is active. Drives the green/red dot in the header." },
  // ── Market Detail (5–13) ──
  { number: 5, method: "GET", path: "/events/{eventId}", page: "market", title: "Parent Event Info", description: "Fetches the parent event — title, image, category — shown as context above the market." },
  { number: 6, method: "GET", path: "/markets/{marketId}", page: "market", title: "Market Detail", description: "Core market data: YES/NO prices, volume, close time, resolution status, and rules." },
  { number: 7, method: "GET", path: "/forecast", page: "market", title: "Market Forecast", description: "Aggregated forecast data for prediction markets, displayed when the API returns data." },
  { number: 8, method: "GET", path: "/orderbook/{marketId}", page: "market", title: "Order Book Depth", description: "YES and NO order depth at each price level, rendered as a bar chart. Auto-refreshes every 10 s." },
  { number: 9, method: "POST", path: "/orders", page: "market", title: "Place Order", description: "Submits a buy or sell order. Returns an unsigned Solana transaction for wallet signing." },
  { number: 10, method: "GET", path: "/orders", page: "market", title: "Your Orders", description: "Lists all orders for the connected wallet — status, fill progress, and average fill price." },
  { number: 11, method: "GET", path: "/orders/{orderPubkey}", page: "market", title: "Order Details", description: "Click any order row to fetch full details: order ID, size, max fill price, and event metadata." },
  { number: 12, method: "GET", path: "/orders/status/{orderPubkey}", page: "market", title: "Order Status Polling", description: "Polls order status every 3 s until filled or failed. Visible in the expanded order detail." },
  { number: 13, method: "GET", path: "/events/{eventId}/markets", page: "market", title: "Related Markets", description: "Other markets in the same event, shown below the main content so users can explore related bets." },
  // ── Positions (14–17) ──
  { number: 14, method: "GET", path: "/positions", page: "/positions", title: "Positions Table", description: "All open positions for the connected wallet — contracts, mark price, PnL, and total value." },
  { number: 15, method: "GET", path: "/positions/{positionPubkey}", page: "/positions", title: "Position Details", description: "Click any position row to fetch full details: fees paid, realized PnL, payout, and sell price." },
  { number: 16, method: "DELETE", path: "/positions/{positionPubkey}", page: "/positions", title: "Close Position", description: "Closes a single position by selling all its contracts. Returns an unsigned transaction." },
  { number: 17, method: "DELETE", path: "/positions", page: "/positions", title: "Close All Positions", description: "Bulk-closes every open position. Falls back to individual closes if the bulk call errors." },
  // ── History (18–19) ──
  { number: 18, method: "GET", path: "/history", page: "/history", title: "Event History", description: "Full timeline of trading events — order creates, fills, failures, payouts, and position updates." },
  { number: 19, method: "POST", path: "/positions/{pubkey}/claim", page: "/history", title: "Claim Payout", description: "Claims the payout from a winning / resolved position. Returns a transaction for signing." },
  // ── Profile (20–21) ──
  { number: 20, method: "GET", path: "/profiles/{ownerPubkey}", page: "/profile", title: "Profile Stats", description: "Aggregated performance: realized PnL, total volume, prediction count, win rate, and portfolio value." },
  { number: 21, method: "GET", path: "/profiles/{ownerPubkey}/pnl-history", page: "/profile", title: "PnL History Chart", description: "PnL plotted over time with a configurable interval (24 h / 1 W / 1 M) and data-point count." },
  // ── Community (22–24) ──
  { number: 22, method: "GET", path: "/leaderboards", page: "/community", title: "Leaderboard", description: "Top traders ranked by PnL, volume, or win rate across all-time, weekly, and monthly periods." },
  { number: 23, method: "GET", path: "/trades", page: "/community", title: "Trades Feed", description: "Live platform-wide trades feed showing trader, side, amount, and price. Refreshes every 15 s." },
  { number: 24, method: "GET", path: "/vault-info", page: "/community", title: "Vault Info", description: "Platform vault balance and on-chain data — a measure of the protocol's total value locked." },
];

const PAGE_LABELS = ["Discover", "Market", "Positions", "History", "Profile", "Community"];

function pageGroupIndex(step: TourStep): number {
  if (step.page === "/discover") return 0;
  if (step.page === "market") return 1;
  if (step.page === "/positions") return 2;
  if (step.page === "/history") return 3;
  if (step.page === "/profile") return 4;
  if (step.page === "/community") return 5;
  return 0;
}

// ─── Context ────────────────────────────────────────────────────────────────

interface TourContextValue {
  isActive: boolean;
  currentStepIndex: number;
  totalSteps: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TourContext = createContext<TourContextValue>({
  isActive: false,
  currentStepIndex: 0,
  totalSteps: TOUR_STEPS.length,
  startTour: () => {},
  endTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
});

export const useTour = () => useContext(TourContext);

// ─── Provider ───────────────────────────────────────────────────────────────

function isOnPage(page: string, pathname: string): boolean {
  return page === "market" ? pathname.startsWith("/market/") : pathname === page;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [pendingStepIndex, setPendingStepIndex] = useState<number | null>(null);
  const [marketPath, setMarketPath] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const resolvePath = useCallback(
    async (page: string): Promise<string | null> => {
      if (page !== "market") return page;
      if (pathname.startsWith("/market/")) return pathname;
      if (marketPath) return marketPath;
      try {
        const events = await getEvents({ includeMarkets: true });
        const evt = events?.[0];
        const mkt = evt?.markets?.[0];
        if (mkt && evt) {
          const p = `/market/${mkt.marketId}?event=${evt.eventId}`;
          setMarketPath(p);
          return p;
        }
      } catch { /* ignore */ }
      return null;
    },
    [pathname, marketPath],
  );

  // When pathname changes and we have a pending step, commit it
  useEffect(() => {
    if (pendingStepIndex === null) return;
    const target = TOUR_STEPS[pendingStepIndex];
    if (isOnPage(target.page, pathname)) {
      setStepIndex(pendingStepIndex);
      setPendingStepIndex(null);
    }
  }, [pathname, pendingStepIndex]);

  const goToStep = useCallback(
    async (idx: number) => {
      const step = TOUR_STEPS[idx];
      if (isOnPage(step.page, pathname)) {
        // Same page — update immediately
        setStepIndex(idx);
        setPendingStepIndex(null);
      } else {
        // Different page — queue the step, navigate, wait for pathname to change
        setPendingStepIndex(idx);
        const target = await resolvePath(step.page);
        if (target) router.push(target);
      }
    },
    [pathname, resolvePath, router],
  );

  const startTour = useCallback(async () => {
    setStepIndex(0);
    setPendingStepIndex(null);
    setIsActive(true);
    const step = TOUR_STEPS[0];
    if (!isOnPage(step.page, pathname)) {
      const target = await resolvePath(step.page);
      if (target) router.push(target);
    }
  }, [pathname, resolvePath, router]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setPendingStepIndex(null);
  }, []);

  const nextStep = useCallback(async () => {
    const current = pendingStepIndex ?? stepIndex;
    if (current >= TOUR_STEPS.length - 1) {
      endTour();
      return;
    }
    await goToStep(current + 1);
  }, [stepIndex, pendingStepIndex, goToStep, endTour]);

  const prevStep = useCallback(async () => {
    const current = pendingStepIndex ?? stepIndex;
    if (current <= 0) return;
    await goToStep(current - 1);
  }, [stepIndex, pendingStepIndex, goToStep]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, nextStep, prevStep, endTour]);

  const isNavigating = pendingStepIndex !== null;

  return (
    <TourContext.Provider
      value={{ isActive, currentStepIndex: stepIndex, totalSteps: TOUR_STEPS.length, startTour, endTour, nextStep, prevStep }}
    >
      {children}
      {isActive && !isNavigating && <TourOverlay step={TOUR_STEPS[stepIndex]} stepIndex={stepIndex} />}
      {isActive && isNavigating && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/55 transition-opacity duration-200" />,
        document.body,
      )}
    </TourContext.Provider>
  );
}

// ─── Overlay ────────────────────────────────────────────────────────────────

function TourOverlay({ step, stepIndex }: { step: TourStep; stepIndex: number }) {
  const { nextStep, prevStep, endTour, totalSteps } = useTour();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  // Find & scroll to target element — keeps old rect visible during transition
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    let attempts = 0;
    let scrollTimer: ReturnType<typeof setTimeout>;
    const maxAttempts = 20;

    const find = () => {
      const el = document.querySelector(`[data-tour-step="${step.number}"]`);
      if (el && !cancelled) {
        const quickRect = el.getBoundingClientRect();
        const inView = quickRect.top >= 0 && quickRect.bottom <= window.innerHeight;

        if (inView) {
          setRect(quickRect);
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          scrollTimer = setTimeout(() => {
            if (!cancelled) {
              rafRef.current = requestAnimationFrame(() => {
                if (!cancelled) setRect(el.getBoundingClientRect());
              });
            }
          }, 250);
        }
        return true;
      }
      return false;
    };

    if (!find()) {
      const iv = setInterval(() => {
        attempts++;
        if (find() || attempts > maxAttempts) clearInterval(iv);
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(iv);
        clearTimeout(scrollTimer);
        cancelAnimationFrame(rafRef.current);
      };
    }
    return () => {
      cancelled = true;
      clearTimeout(scrollTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [step.number, mounted]);

  // Keep rect in sync on scroll / resize using rAF
  useEffect(() => {
    if (!mounted) return;
    let ticking = false;

    const update = () => {
      const el = document.querySelector(`[data-tour-step="${step.number}"]`);
      if (el) setRect(el.getBoundingClientRect());
      ticking = false;
    };

    const onEvent = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onEvent, { capture: true, passive: true });
    window.addEventListener("resize", onEvent, { passive: true });
    return () => {
      window.removeEventListener("scroll", onEvent, true);
      window.removeEventListener("resize", onEvent);
    };
  }, [step.number, mounted]);

  if (!mounted) return null;

  const padding = 10;
  const colors = METHOD_COLORS[step.method] ?? "";
  const group = pageGroupIndex(step);

  // Popover positioning
  const popoverStyle = ((): React.CSSProperties => {
    if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const pw = 380;
    const ph = 260;
    const gap = 14;
    const safeLeft = Math.max(16, Math.min(rect.left, window.innerWidth - pw - 16));
    if (rect.bottom + gap + ph < window.innerHeight) return { top: rect.bottom + gap, left: safeLeft };
    if (rect.top - gap - ph > 0) return { top: rect.top - gap - ph, left: safeLeft };
    return { top: Math.max(16, rect.top), left: Math.min(rect.right + gap, window.innerWidth - pw - 16) };
  })();

  return createPortal(
    <>
      {/* Spotlight with shadow overlay */}
      {rect && (
        <div
          className="fixed z-[10000] rounded-lg border-2 border-primary/80 pointer-events-none"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55), 0 0 30px 4px rgba(59,130,246,0.25)",
            transition: "top 0.25s ease-out, left 0.25s ease-out, width 0.25s ease-out, height 0.25s ease-out",
            willChange: "top, left, width, height",
          }}
        />
      )}

      {/* Dark backdrop when element not found */}
      {!rect && <div className="fixed inset-0 z-[9999] bg-black/55 transition-opacity duration-200" />}

      {/* Popover card */}
      <div
        className="fixed z-[10001] w-[380px] rounded-xl border border-border bg-popover p-5 shadow-2xl"
        style={{ ...popoverStyle, transition: "top 0.25s ease-out, left 0.25s ease-out", willChange: "top, left" }}
      >
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <Button variant="ghost" size="icon-xs" onClick={endTour} aria-label="End tour">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Inline endpoint badge */}
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs leading-tight", colors)}>
            <span className="font-bold">#{step.number}</span>
            <span className="font-semibold">{step.method}</span>
            <span className="opacity-70">{step.path}</span>
          </span>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold">{step.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
          </div>

          {/* Progress bar */}
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" onClick={prevStep} disabled={stepIndex === 0} className="gap-1 text-xs h-8">
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </Button>

            {/* Page indicator dots */}
            <div className="flex items-center gap-1.5">
              {PAGE_LABELS.map((label, i) => (
                <div key={label} className={cn("h-2 w-2 rounded-full transition-colors", group === i ? "bg-primary" : "bg-muted-foreground/25")} title={label} />
              ))}
            </div>

            <Button size="sm" onClick={nextStep} className="gap-1 text-xs h-8">
              {stepIndex === totalSteps - 1 ? "Finish" : "Next"}
              {stepIndex < totalSteps - 1 && <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
