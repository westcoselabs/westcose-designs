"use client";

import Image from "next/image";
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { CaretLeft, CaretRight, Shuffle, X } from "@phosphor-icons/react/dist/ssr";

import { IconButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { GlassCard } from "@/components/ui/glass-panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  APPAREL_BACKS,
  APPAREL_FRONTS,
  type ApparelBack,
  type ApparelFront,
} from "@/lib/home/apparel-manifest";

type Side = "front" | "back";

type RingStyle = CSSProperties & {
  "--wc-print-x": string;
  "--wc-print-y": string;
};

const SWIPE_THRESHOLD = 44;

const VIEW_OPTIONS = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
] as const;

/** -1 = parked left, 0 = showing, 1 = parked right (wraps for carousels). */
function slotFor(index: number, active: number, count: number) {
  const offset = (index - active + count) % count;
  if (offset === 0) return 0;
  return offset <= count / 2 ? 1 : -1;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function ShirtStack({
  items,
  active,
  loaded,
  onLoad,
}: {
  items: readonly (ApparelFront | ApparelBack)[];
  active: number;
  loaded: ReadonlySet<string>;
  onLoad: (id: string) => void;
}) {
  return (
    <div className="wc-apparel-shirt__stack">
      {items.map((item, index) => {
        const slot = slotFor(index, active, items.length);
        return (
          <div
            key={item.id}
            className="wc-apparel-shirt__image"
            data-slot={slot}
            data-loaded={loaded.has(item.id) || undefined}
            aria-hidden={slot !== 0}
          >
            <Image
              src={item.src}
              alt={slot === 0 ? item.alt : ""}
              fill
              sizes="(max-width: 767px) 92vw, 30vw"
              onLoad={() => onLoad(item.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

function Cycler({
  side,
  index,
  item,
  count,
  onStep,
}: {
  side: Side;
  index: number;
  item: ApparelFront | ApparelBack;
  count: number;
  onStep: (side: Side, delta: 1 | -1) => void;
}) {
  const label = side === "front" ? "Front" : "Back";
  const tone = side === "front" ? "signal" : "coastal";

  return (
    <GlassCard
      shape="pill"
      tone={side === "front" ? "signal-soft" : "coastal"}
      className="wc-apparel-cycler"
    >
      <IconButton
        label={`Previous ${label.toLowerCase()} design`}
        tone={tone}
        onClick={() => onStep(side, -1)}
      >
        <CaretLeft size={16} weight="bold" aria-hidden="true" />
      </IconButton>
      <div className="wc-apparel-cycler__text">
        <span className="wc-apparel-cycler__meta">
          <span className="wc-apparel-cycler__dot" aria-hidden="true" />
          {label}
          <span className="wc-apparel-cycler__count">
            {pad(index + 1)} / {pad(count)}
          </span>
        </span>
        <span className="wc-apparel-cycler__name">{item.title}</span>
      </div>
      <IconButton
        label={`Next ${label.toLowerCase()} design`}
        tone={tone}
        emphasis="accent"
        onClick={() => onStep(side, 1)}
      >
        <CaretRight size={16} weight="bold" aria-hidden="true" />
      </IconButton>
    </GlassCard>
  );
}

export function ApparelMixer() {
  const [front, setFront] = useState(APPAREL_FRONTS.length - 1);
  const [back, setBack] = useState(0);
  const [view, setView] = useState<Side>("front");
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const frontItem = APPAREL_FRONTS[front];
  const backItem = APPAREL_BACKS[back];
  const [placementArea, placementSize] = frontItem.placement.split(" · ");

  const step = useCallback((side: Side, delta: 1 | -1) => {
    if (side === "front") {
      setFront((value) => (value + delta + APPAREL_FRONTS.length) % APPAREL_FRONTS.length);
    } else {
      setBack((value) => (value + delta + APPAREL_BACKS.length) % APPAREL_BACKS.length);
    }
    // On phones only one side is large; follow the side being changed.
    setView(side);
  }, []);

  const shuffle = useCallback(() => {
    const pick = (count: number, current: number) => {
      if (count < 2) return current;
      const next = Math.floor(Math.random() * (count - 1));
      return next >= current ? next + 1 : next;
    };
    setFront((value) => pick(APPAREL_FRONTS.length, value));
    setBack((value) => pick(APPAREL_BACKS.length, value));
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    step(view, dx < 0 ? 1 : -1);
  };

  const markLoaded = useCallback((id: string) => {
    setLoaded((current) => (current.has(id) ? current : new Set(current).add(id)));
  }, []);

  const ringStyle: RingStyle = {
    "--wc-print-x": `${frontItem.print.x}%`,
    "--wc-print-y": `${frontItem.print.y}%`,
  };

  return (
    <div className="wc-apparel-mixer" data-view={view}>
      <div className="wc-apparel-mixer__bar">
        <Chip as="p" tone="signal" className="wc-apparel-mixer__tag" data-apparel-reveal>
          <Shuffle size={14} weight="bold" aria-hidden="true" />
          Mix &amp; match <span aria-hidden="true">·</span> any front × any back
        </Chip>

        <SegmentedControl
          className="wc-apparel-mixer__views"
          label="Choose which side to view"
          value={view}
          options={VIEW_OPTIONS}
          onChange={setView}
        >
          <IconButton
            label="Shuffle to a random front and back"
            emphasis="solid"
            onClick={shuffle}
          >
            <Shuffle size={16} weight="bold" aria-hidden="true" />
          </IconButton>
        </SegmentedControl>
      </div>

      <div
        className="wc-apparel-mixer__stage"
        data-apparel-reveal
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointerStart.current = null)}
      >
        <figure
          className="wc-apparel-shirt"
          data-side="front"
          data-active={view === "front" || undefined}
        >
          <div className="wc-apparel-shirt__frame">
            <ShirtStack
              items={APPAREL_FRONTS}
              active={front}
              loaded={loaded}
              onLoad={markLoaded}
            />
            <span
              className="wc-apparel-shirt__ring"
              style={ringStyle}
              data-ready={loaded.has(frontItem.id) || undefined}
              aria-hidden="true"
            >
              <span className="wc-apparel-shirt__callout">
                <strong>{placementArea}</strong>
                <span>
                  {placementSize} · {frontItem.method}
                </span>
              </span>
            </span>
          </div>
          <figcaption className="wc-sr-only">
            Front: {frontItem.title}, {frontItem.placement}, {frontItem.method} print.
          </figcaption>
          <button
            type="button"
            className="wc-apparel-shirt__peek"
            onClick={() => setView("front")}
            aria-label="Show the front"
          >
            <span>Front</span>
          </button>
        </figure>

        <figure
          className="wc-apparel-shirt"
          data-side="back"
          data-active={view === "back" || undefined}
        >
          <div className="wc-apparel-shirt__frame">
            <ShirtStack
              items={APPAREL_BACKS}
              active={back}
              loaded={loaded}
              onLoad={markLoaded}
            />
          </div>
          <figcaption className="wc-sr-only">
            Back: {backItem.title}, {backItem.placement}, {backItem.method} print.
          </figcaption>
          <button
            type="button"
            className="wc-apparel-shirt__peek"
            onClick={() => setView("back")}
            aria-label="Show the back"
          >
            <span>Back</span>
          </button>
        </figure>

        <p className="wc-apparel-mixer__hint" aria-hidden="true">
          Swipe to change the {view}
        </p>
      </div>

      <div className="wc-apparel-mixer__controls" data-apparel-reveal>
        <Cycler
          side="front"
          index={front}
          item={frontItem}
          count={APPAREL_FRONTS.length}
          onStep={step}
        />
        <span className="wc-apparel-mixer__x" aria-hidden="true">
          <X size={16} weight="bold" />
        </span>
        <Cycler
          side="back"
          index={back}
          item={backItem}
          count={APPAREL_BACKS.length}
          onStep={step}
        />
      </div>

      <p className="wc-sr-only" aria-live="polite">
        Front {front + 1} of {APPAREL_FRONTS.length}: {frontItem.title}. Back{" "}
        {back + 1} of {APPAREL_BACKS.length}: {backItem.title}.
      </p>
    </div>
  );
}
