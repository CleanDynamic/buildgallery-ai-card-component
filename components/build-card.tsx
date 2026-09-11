'use client'

import { useId, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Shape =
  | 'AGENT'
  | 'WORKFLOW'
  | 'APP'
  | 'PROMPT'
  | 'DATASET'
  | 'STUDY'
  | 'MEDIA'
  | 'TECHNIQUE'

export type Category =
  | 'instruction'
  | 'configuration'
  | 'data'
  | 'artefact'
  | 'evidence'
  | 'narrative'
  | 'agents'
  | 'breakage'
  | 'media'

export type Media = {
  kind: 'image' | 'video'
  src: string
  width: number
  height: number
  alt: string
  duration?: string
}

export type Entry = {
  text?: string
  media?: Media
}

export type Part = {
  label: string
  category: Category
}

export type BuildCardProps = {
  layout: 'feed' | 'grid'
  title: string
  shape: Shape
  entries: Entry[]
  reproduced: number
  confirmed: string
  model: string
  parts: Part[]
  rebuilt?: { sourceTitle: string; handle: string; changes: string }
  bounty?: { unsolved: number; amount: string }
  defaultOpen?: boolean
  /** Pins the pointer-hover appearance, for documentation only. */
  hover?: boolean
  loading?: boolean
}

/* ------------------------------------------------------------------ */
/*  Geometry                                                           */
/* ------------------------------------------------------------------ */

const FEED = { frame: 600, column: 550, minH: 275, maxH: 733 }
const GRID = { frame: 272, column: 222, slotH: 168 }

function feedMediaHeight(media: Media) {
  const natural = FEED.column / (media.width / media.height)
  return Math.round(Math.min(FEED.maxH, Math.max(FEED.minH, natural)))
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

export function BuildCard(props: BuildCardProps) {
  const {
    layout,
    title,
    shape,
    entries,
    reproduced,
    confirmed,
    model,
    parts,
    rebuilt,
    bounty,
    defaultOpen = false,
    hover = false,
    loading = false,
  } = props

  const [open, setOpen] = useState(defaultOpen)
  const collapsibleId = useId()

  const isGrid = layout === 'grid'
  const column = isGrid ? GRID.column : FEED.column
  const hasMedia = entries.some((e) => e.media)
  const multi = entries.length > 1
  const hidden = entries.length - 1
  const [first, ...rest] = entries

  if (loading) {
    return (
      <article
        className="bc-card"
        data-layout={layout}
        aria-busy="true"
        aria-label="Loading build"
      >
        <div className="bc-thread">
          <div className="bc-thread-inner">
            <div
              className="bc-sk bc-sk-media"
              style={{ width: column, height: isGrid ? GRID.slotH : 309 }}
            />
          </div>
        </div>
        <div className="bc-below">
          <div className="bc-sk bc-sk-title" />
          <div className="bc-sk bc-sk-title bc-sk-title-2" />
          <div className="bc-sk bc-sk-plaque" />
          <div className="bc-sk-chips">
            <div className="bc-sk bc-sk-chip" />
            <div className="bc-sk bc-sk-chip" />
            <div className="bc-sk bc-sk-chip" />
          </div>
        </div>
      </article>
    )
  }

  const showText = !isGrid || !hasMedia
  const visibleParts = parts.length > 5 ? parts.slice(0, 4) : parts
  const overflowCount = parts.length > 5 ? parts.length - 4 : 0

  return (
    <article
      className="bc-card"
      data-layout={layout}
      data-hover={hover || undefined}
      data-bounty={bounty ? '' : undefined}
      data-empty={hasMedia ? undefined : ''}
    >
      {bounty && (
        <svg className="bc-bounty-border" aria-hidden="true">
          <rect
            x="0.75"
            y="0.75"
            width="calc(100% - 1.5px)"
            height="calc(100% - 1.5px)"
            rx="13.25"
            ry="13.25"
            fill="none"
            stroke="var(--cat-breakage)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        </svg>
      )}

      {/* Thread box */}
      <div className="bc-thread" data-multi={multi && !isGrid ? '' : undefined}>
        <div className="bc-thread-inner">
          {showText && first.text && <p className="bc-text">{first.text}</p>}

          {first.media && (
            <div className="bc-railed">
              {open && !isGrid && multi && <span className="bc-rail" aria-hidden="true" />}

              <EntryMedia
                media={first.media}
                layout={layout}
                withGap={Boolean(showText && first.text)}
                shape={shape}
                count={isGrid && multi ? `1/${entries.length}` : undefined}
              />

              {!isGrid && multi && (
                <div className="bc-collapse" data-open={open || undefined}>
                  <div
                    className="bc-collapse-inner"
                    id={collapsibleId}
                    inert={!open}
                    aria-hidden={!open}
                  >
                    {rest.map((entry, i) => (
                      <div key={i}>
                        <hr className="bc-hairline" />
                        {entry.text && <p className="bc-text">{entry.text}</p>}
                        {entry.media && (
                          <EntryMedia
                            media={entry.media}
                            layout={layout}
                            withGap={Boolean(entry.text)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isGrid && multi && (
          <>
            <hr className="bc-unfold-line" />
            <button
              type="button"
              className="bc-unfold"
              aria-expanded={open}
              aria-controls={collapsibleId}
              onClick={() => setOpen((v) => !v)}
            >
              <span>{open ? 'Show less' : `Show thread · ${hidden} more`}</span>
              <svg
                className="bc-chevron"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Below the thread box, on the frame */}
      <div className="bc-below">
        <h2 className="bc-title">{title}</h2>

        {rebuilt && (
          <div className="bc-credit">
            <p className="bc-credit-line">
              Rebuilt from <em className="bc-credit-source">{rebuilt.sourceTitle}</em> by{' '}
              <span className="bc-credit-handle">{rebuilt.handle}</span>
            </p>
            <p className="bc-credit-changes">{rebuilt.changes}</p>
          </div>
        )}

        <div className="bc-plaque">
          <span className="bc-repro">{reproduced} reproduced</span>
          <span className="bc-fresh">
            <span className="bc-lamp" aria-hidden="true" />
            <span>
              confirmed {confirmed}, on <span className="bc-model">{model}</span>
            </span>
          </span>
        </div>

        <ul className="bc-chips" aria-label="Parts">
          {visibleParts.map((part) => (
            <li
              key={part.label}
              className="bc-chip"
              style={{ color: `var(--cat-${part.category})` }}
            >
              {part.label}
            </li>
          ))}
          {overflowCount > 0 && (
            <li className="bc-chip bc-chip-more">+{overflowCount}</li>
          )}
        </ul>

        {bounty && (
          <p className="bc-bounty">
            {bounty.unsolved} {bounty.unsolved === 1 ? 'part' : 'parts'} unsolved · {bounty.amount}
          </p>
        )}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/*  Media                                                              */
/* ------------------------------------------------------------------ */

function EntryMedia({
  media,
  layout,
  withGap,
  shape,
  count,
}: {
  media: Media
  layout: 'feed' | 'grid'
  withGap: boolean
  shape?: Shape
  count?: string
}) {
  const isGrid = layout === 'grid'
  const width = isGrid ? GRID.column : FEED.column
  const height = isGrid ? GRID.slotH : feedMediaHeight(media)
  const play = isGrid ? { box: 36, radius: 10, tri: 14 } : { box: 48, radius: 12, tri: 18 }

  return (
    <div
      className="bc-media"
      data-gap={withGap || undefined}
      style={{ width, height }}
    >
      {media.kind === 'video' ? (
        <video
          className="bc-media-el"
          poster={media.src}
          muted
          playsInline
          preload="none"
          aria-label={media.alt}
        />
      ) : (
        <img
          className="bc-media-el"
          src={media.src}
          width={media.width}
          height={media.height}
          alt={media.alt}
          loading="lazy"
          decoding="async"
        />
      )}

      {shape && <span className="bc-tag bc-tag-tl">{shape}</span>}
      {count && <span className="bc-tag bc-tag-tr">{count}</span>}

      {media.kind === 'video' && (
        <>
          <span
            className="bc-play"
            style={{ width: play.box, height: play.box, borderRadius: play.radius }}
            aria-hidden="true"
          >
            <svg
              width={(play.tri * 16) / 18}
              height={play.tri}
              viewBox="0 0 16 18"
              fill="var(--text)"
            >
              <path d="M0 0L16 9L0 18Z" />
            </svg>
          </span>
          {media.duration && (
            <span className="bc-tag bc-tag-br">{media.duration}</span>
          )}
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles — the card reads only the named tokens                      */
/* ------------------------------------------------------------------ */

const cardStyles = `
.bc-card {
  position: relative;
  box-sizing: border-box;
  width: ${FEED.frame}px;
  padding: 8px 8px 16px;
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  background: var(--card-frame);
  -webkit-backdrop-filter: blur(16px) saturate(1.15);
  backdrop-filter: blur(16px) saturate(1.15);
  color: var(--text);
  transition: transform 160ms, border-color 160ms, box-shadow 160ms;
}
.bc-card[data-layout="grid"] { width: ${GRID.frame}px; }
.bc-card[data-bounty] { border: 0; padding: 9.5px 9.5px 17.5px; }
.bc-bounty-border {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: visible;
}

@media (hover: hover) and (pointer: fine) {
  .bc-card:hover { transform: translateY(-1px); border-color: var(--glass-hi); }
  [data-theme="exhibition"] .bc-card:hover { box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 10%, transparent); }
  [data-theme="dusk"] .bc-card:hover { box-shadow: inset 0 1px 0 var(--glass-hi); }
}
.bc-card[data-hover] { transform: translateY(-1px); border-color: var(--glass-hi); }
[data-theme="exhibition"] .bc-card[data-hover] { box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 10%, transparent); }
[data-theme="dusk"] .bc-card[data-hover] { box-shadow: inset 0 1px 0 var(--glass-hi); }

/* Thread box */
.bc-thread { border-radius: 12px; background: var(--card-thread); }
.bc-card[data-empty] .bc-thread { background: var(--recess); }
.bc-thread-inner { padding: 16px; }
.bc-thread[data-multi] .bc-thread-inner { padding-bottom: 0; }

.bc-text {
  margin: 0;
  font-family: var(--font-figtree);
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: var(--text);
  text-wrap: pretty;
}
.bc-card[data-empty] .bc-text { font-size: 18px; line-height: 26px; }

.bc-media {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: var(--recess);
}
.bc-media[data-gap] { margin-top: 12px; }
.bc-media-el {
  position: absolute; inset: 0;
  display: block; width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}

.bc-tag {
  position: absolute;
  display: inline-flex; align-items: center;
  height: 20px; padding: 0 6px; border-radius: 8px;
  background: var(--recess);
  font-family: var(--font-dm-mono); font-weight: 500;
  font-size: 11px; line-height: 16px;
  letter-spacing: 0.04em; text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}
.bc-tag-tl { top: 8px; left: 8px; }
.bc-tag-tr { top: 8px; right: 8px; }
.bc-tag-br { bottom: 8px; right: 8px; }

.bc-play {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--glass-2);
}
.bc-play svg { display: block; margin-left: 2px; }

/* Rail + collapsible thread */
.bc-railed { position: relative; }
.bc-rail {
  position: absolute; top: 0; bottom: 0; left: -9px;
  width: 2px; border-radius: 1px; background: var(--line);
}
.bc-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 240ms ease-out;
}
.bc-collapse[data-open] { grid-template-rows: 1fr; }
.bc-collapse-inner { min-height: 0; overflow: hidden; }
.bc-hairline {
  height: 1px; border: 0; margin: 8px 0 7px;
  background: var(--line);
}

.bc-unfold-line { height: 1px; border: 0; margin: 16px 0 0; background: var(--line); }
.bc-unfold {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; height: 40px; padding: 0 16px; margin: 0;
  border: 0; border-radius: 0 0 12px 12px; background: none;
  font-family: var(--font-dm-mono); font-weight: 400;
  font-size: 13px; line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--text2);
  cursor: pointer; text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.bc-unfold:hover, .bc-unfold:focus-visible { color: var(--text); outline: none; }
.bc-chevron { flex: none; transition: transform 240ms ease-out; }
.bc-unfold[aria-expanded="true"] .bc-chevron { transform: rotate(180deg); }

/* Below the thread box */
.bc-below { padding: 0 16px; margin-top: 16px; }

.bc-title {
  margin: 0;
  font-family: var(--font-bodoni); font-weight: 500;
  font-size: 22px; line-height: 28px;
  color: var(--text);
  text-wrap: balance;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
  overflow: hidden;
}
.bc-card[data-empty] .bc-title { font-size: 26px; line-height: 32px; }

.bc-credit { margin-top: 8px; }
.bc-credit-line {
  margin: 0;
  font-family: var(--font-figtree); font-weight: 400;
  font-size: 16px; line-height: 22px; color: var(--text2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bc-credit-source { font-style: italic; color: var(--text); }
.bc-credit-handle { font-weight: 500; color: var(--text); }
.bc-credit-changes {
  margin: 4px 0 0;
  font-family: var(--font-dm-mono); font-weight: 400;
  font-size: 13px; line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--text2);
}

.bc-plaque {
  display: flex; flex-wrap: wrap; align-items: center;
  column-gap: 12px; row-gap: 6px;
  min-height: 28px; margin-top: 12px;
}
.bc-repro {
  display: inline-flex; align-items: center; flex: none;
  height: 24px; padding: 0 8px; border-radius: 8px;
  background: var(--evidence-fill);
  font-family: var(--font-dm-mono); font-weight: 500;
  font-size: 13px; line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--evidence);
}
.bc-fresh {
  display: inline-flex; align-items: center; gap: 8px; flex: none;
  max-width: 100%;
  white-space: nowrap;
  font-family: var(--font-dm-mono); font-weight: 400;
  font-size: 13px; line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--text2);
}
.bc-fresh > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
/* 222px cannot hold the freshness line on one row; keep the model name and wrap instead. */
.bc-card[data-layout="grid"] .bc-fresh { align-items: flex-start; white-space: normal; }
.bc-card[data-layout="grid"] .bc-fresh > span:last-child { overflow: visible; text-wrap: pretty; }
.bc-card[data-layout="grid"] .bc-lamp { margin-top: 6px; }
.bc-lamp {
  width: 10px; height: 6px; flex: none;
  border-radius: 5px / 3px;
  background: var(--lit);
  box-shadow: 0 0 6px color-mix(in srgb, var(--lit) 60%, transparent);
}
.bc-model { font-weight: 500; color: var(--text); }

.bc-chips {
  display: flex; gap: 6px; height: 24px;
  margin: 12px 0 0; padding: 0; list-style: none;
  overflow: hidden; white-space: nowrap;
}
.bc-chip {
  display: inline-flex; align-items: center; flex: none;
  box-sizing: border-box; height: 24px; padding: 0 8px;
  border: 1px solid currentColor; border-radius: 8px;
  font-family: var(--font-dm-mono); font-weight: 500;
  font-size: 12px; line-height: 16px;
  font-variant-numeric: tabular-nums;
}
.bc-chip-more { border-color: var(--line); color: var(--text2); }

.bc-bounty {
  margin: 8px 0 0;
  font-family: var(--font-dm-mono); font-weight: 400;
  font-size: 13px; line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--cat-breakage);
}

/* Skeleton */
.bc-sk {
  background: linear-gradient(
    90deg,
    var(--recess) 0%,
    color-mix(in srgb, var(--recess), var(--text) 6%) 50%,
    var(--recess) 100%
  );
  background-size: 200% 100%;
  animation: bc-shimmer 2.4s linear infinite;
}
.bc-sk-media { border-radius: 10px; }
.bc-sk-title { height: 28px; border-radius: 8px; }
.bc-sk-title + .bc-sk-title { margin-top: 0; }
.bc-sk-title-2 { width: calc(100% * 380 / 550); }
.bc-sk-plaque { width: 200px; height: 24px; margin-top: 12px; border-radius: 8px; }
.bc-sk-chips { display: flex; gap: 6px; margin-top: 12px; }
.bc-sk-chip { width: 72px; height: 24px; border-radius: 8px; }
@keyframes bc-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .bc-collapse, .bc-chevron, .bc-card { transition: none; }
  .bc-sk { animation: none; }
}
`

/* ------------------------------------------------------------------ */
/*  Themes — the only place a colour value is written                  */
/* ------------------------------------------------------------------ */

const themeStyles = `
[data-theme="exhibition"] {
  --bg: #E4E6E8;
  --recess: #D3D7DB;
  --text: #1B2026;
  --text2: #565E66;
  --line: #C6CBD1;
  --card-frame: rgba(255,255,255,.42);
  --card-thread: rgba(255,255,255,.55);
  --glass-border: rgba(255,255,255,.80);
  --glass-hi: rgba(255,255,255,.95);
  --glass-2: rgba(255,255,255,.34);
  --evidence: #0F6E63;
  --evidence-fill: #BFE3DC;
  --lit: #D9A441;
  --cat-instruction: #9C3E12;
  --cat-configuration: #0F6B31;
  --cat-data: #1D4ED8;
  --cat-artefact: #8F4309;
  --cat-evidence: #0E635C;
  --cat-narrative: #565B63;
  --cat-agents: #6D28D9;
  --cat-breakage: #B91C1C;
  --cat-media: #BE185D;
}
[data-theme="dusk"] {
  --bg: #1F1B2B;
  --recess: #372F4A;
  --text: #EEEAF4;
  --text2: #B3ABC6;
  --line: #4B4362;
  --card-frame: rgba(72,63,104,.42);
  --card-thread: rgba(238,234,244,.06);
  --glass-border: rgba(238,234,244,.14);
  --glass-hi: rgba(238,234,244,.22);
  --glass-2: rgba(72,63,104,.26);
  --evidence: #86BDD3;
  --evidence-fill: rgba(134,189,211,.16);
  --lit: #D9A441;
  --cat-instruction: #F0865A;
  --cat-configuration: #5CCB7C;
  --cat-data: #6AA1FF;
  --cat-artefact: #F5B83D;
  --cat-evidence: #86BDD3;
  --cat-narrative: #A8A6A3;
  --cat-agents: #A78BFA;
  --cat-breakage: #F26D6D;
  --cat-media: #F472B6;
}

.bc-page { min-height: 100dvh; background: var(--bg); }
.bc-themes { display: flex; flex-wrap: wrap; align-items: stretch; }
.bc-theme {
  flex: 1 1 960px; min-width: 0;
  padding: 40px 32px 64px;
  background: var(--bg); color: var(--text);
  overflow-x: auto;
}
.bc-theme-head {
  display: flex; align-items: baseline; gap: 12px;
  margin: 0 0 32px;
}
.bc-theme-name {
  margin: 0;
  font-family: var(--font-bodoni); font-weight: 500;
  font-size: 26px; line-height: 32px; color: var(--text);
}
.bc-theme-page {
  font-family: var(--font-dm-mono); font-weight: 400;
  font-size: 13px; line-height: 18px; color: var(--text2);
}
.bc-variant { margin: 0 0 40px; }
.bc-variant-title {
  margin: 0 0 12px;
  font-family: var(--font-figtree); font-weight: 500;
  font-size: 16px; line-height: 22px; color: var(--text);
}
.bc-variant-row { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 24px; }
.bc-figure { margin: 0; display: flex; flex-direction: column; gap: 8px; }
.bc-figure figcaption {
  font-family: var(--font-dm-mono); font-weight: 400;
  font-size: 13px; line-height: 18px; color: var(--text2);
}
`

/* ------------------------------------------------------------------ */
/*  Sample records                                                     */
/* ------------------------------------------------------------------ */

const IMG = {
  trace: { kind: 'image', src: '/media/agent-trace-16x9.jpg', width: 1024, height: 576, alt: 'Terminal showing an agent trace with nested tool calls' },
  board: { kind: 'image', src: '/media/workflow-board-4x3.jpg', width: 1024, height: 768, alt: 'Hand-drawn workflow diagram on paper' },
  phone: { kind: 'image', src: '/media/phone-eval-9x16.jpg', width: 576, height: 1024, alt: 'Phone screenshot of an evaluation dashboard' },
  graph: { kind: 'image', src: '/media/retrieval-graph-1x1.jpg', width: 1024, height: 1024, alt: 'Embedding graph of retrieval clusters' },
  panorama: { kind: 'image', src: '/media/panorama-5x1.jpg', width: 1024, height: 205, alt: 'Panoramic view of a server hall' },
  portrait: { kind: 'image', src: '/media/portrait-1x3.jpg', width: 341, height: 1024, alt: 'Tall printed strip of run results' },
  demo: { kind: 'video', src: '/media/demo-poster-16x9.jpg', width: 1024, height: 576, alt: 'Screen recording of the agent answering a ticket', duration: '0:42' },
} satisfies Record<string, Media>

const PARTS: Part[] = [
  { label: 'system prompt', category: 'instruction' },
  { label: 'router.yaml', category: 'configuration' },
  { label: 'eval set', category: 'data' },
  { label: 'traces', category: 'evidence' },
  { label: 'retry log', category: 'breakage' },
  { label: 'demo.mp4', category: 'media' },
  { label: 'agent graph', category: 'agents' },
]

const base = {
  title: 'A support triage agent that cites its own sources before it answers',
  shape: 'AGENT' as Shape,
  reproduced: 41,
  confirmed: '3 days ago',
  model: 'sonnet-4.5',
  parts: PARTS,
}

const oneEntry: Entry[] = [
  {
    text: 'Every reply this agent sends is preceded by a retrieval step whose results are pinned into the context as numbered sources. If a claim in the draft cannot be traced back to one of those numbers, the draft is rejected and rewritten before anything reaches the customer.',
    media: IMG.trace,
  },
]

const fourEntries: Entry[] = [
  {
    text: 'The whole thing started as one prompt. Splitting it into four small steps made it cheaper, slower, and far easier to reproduce.',
    media: IMG.board,
  },
  {
    text: 'Step two runs the evaluation set on every change.',
    media: IMG.phone,
  },
  {
    media: IMG.graph,
  },
  {
    text: 'The last step records a short screen capture of the agent handling a real ticket end to end, which turned out to be the single most convincing piece of evidence for anyone deciding whether to try the build themselves. Every reproduction attaches its own.',
    media: IMG.demo,
  },
]

const textOnly: Entry[] = [
  {
    text: 'You are a triage assistant. Read the ticket, name the product area in one word, then rate urgency from one to four. If the customer mentions money already taken, urgency is four regardless of tone. Never apologise; route instead. Return only the two values.',
  },
]

/* ------------------------------------------------------------------ */
/*  Showcase                                                           */
/* ------------------------------------------------------------------ */

type VariantSpec = {
  name: string
  feed: Omit<BuildCardProps, 'layout'>
  grid?: boolean
}

const variants: VariantSpec[] = [
  { name: '1. One entry, collapsed', feed: { ...base, entries: oneEntry }, grid: true },
  {
    name: '2. Four entries, collapsed',
    feed: { ...base, title: 'Rebuilding the triage workflow as four small steps', shape: 'WORKFLOW', entries: fourEntries },
    grid: true,
  },
  {
    name: '3. Four entries, unfolded',
    feed: { ...base, title: 'Rebuilding the triage workflow as four small steps', shape: 'WORKFLOW', entries: fourEntries, defaultOpen: true },
  },
  {
    name: '4. No picture',
    feed: { ...base, title: 'The forty-word triage prompt', shape: 'PROMPT', entries: textOnly },
    grid: true,
  },
  {
    name: '5a. 5:1 panorama, cropped to 550 × 275',
    feed: { ...base, title: 'Where the eval set actually runs', shape: 'DATASET', entries: [{ text: 'Shot on the day the full evaluation set first ran without a single timeout.', media: IMG.panorama }] },
  },
  {
    name: '5b. 1:3 portrait, cropped to 550 × 733',
    feed: { ...base, title: 'Two hundred runs on one strip of paper', shape: 'STUDY', entries: [{ text: 'Printed every run so the drift was visible without a chart.', media: IMG.portrait }] },
  },
  {
    name: '6. Rebuilt item',
    feed: {
      ...base,
      entries: oneEntry,
      rebuilt: {
        sourceTitle: 'Cited triage agent, v1',
        handle: '@ayo',
        changes: 'Δ model → llama-3-70b · +1 retrieval step · cost £42/mo → £0',
      },
    },
  },
  {
    name: '7. Open bounty',
    feed: { ...base, entries: oneEntry, bounty: { unsolved: 1, amount: '£150' } },
  },
  { name: '8. Hover state', feed: { ...base, entries: oneEntry, hover: true } },
  { name: '9. Loading skeleton', feed: { ...base, entries: oneEntry, loading: true }, grid: true },
]

function ThemeColumn({ theme, name, page }: { theme: 'exhibition' | 'dusk'; name: string; page: string }) {
  return (
    <section className="bc-theme" data-theme={theme} aria-label={`${name} theme`}>
      <header className="bc-theme-head">
        <h1 className="bc-theme-name">{name}</h1>
        <span className="bc-theme-page">page {page}</span>
      </header>

      {variants.map((v) => (
        <section key={v.name} className="bc-variant" aria-label={v.name}>
          <h2 className="bc-variant-title">{v.name}</h2>
          <div className="bc-variant-row">
            <figure className="bc-figure">
              <figcaption>Feed 600</figcaption>
              <BuildCard layout="feed" {...v.feed} />
            </figure>
            {v.grid && (
              <figure className="bc-figure">
                <figcaption>Grid 272</figcaption>
                <BuildCard layout="grid" {...v.feed} />
              </figure>
            )}
          </div>
        </section>
      ))}
    </section>
  )
}

export default function BuildCardShowcase() {
  return (
    <main className="bc-page">
      <style dangerouslySetInnerHTML={{ __html: themeStyles + cardStyles }} />
      <div className="bc-themes">
        <ThemeColumn theme="exhibition" name="Exhibition" page="#E4E6E8" />
        <ThemeColumn theme="dusk" name="Dusk" page="#1F1B2B" />
      </div>
    </main>
  )
}
