import { useEffect, useReducer } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Check,
  CirclePause,
  CirclePlay,
  RotateCcw,
  Sparkles,
  Timer,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createInitialState,
  visualizerReducer,
  type CharacterComparison,
} from "@/lib/palindrome-visualizer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palindrome Checker — Stack & Queue Visualizer" },
      {
        name: "description",
        content:
          "Explore real stack and queue operations as they check whether a word or phrase is a palindrome.",
      },
      { property: "og:title", content: "Palindrome Checker — Stack & Queue Visualizer" },
      {
        property: "og:description",
        content:
          "Step through push, pop, enqueue, dequeue, and character comparisons in an interactive DSA lesson.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const examples = ["MADAM", "LEVEL", "RACE CAR", "HELLO"];
const playbackDelay = 720;

function Index() {
  const [state, dispatch] = useReducer(visualizerReducer, createInitialState());

  // Autoplay uses the exact reducer step as manual playback. Cleanup on pause,
  // completion, input changes, and reset prevents any leftover timer ticks.
  useEffect(() => {
    if (!state.isPlaying || state.status !== "running") return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), playbackDelay);
    return () => window.clearInterval(timer);
  }, [state.isPlaying, state.status]);

  const currentStep = state.cursor;
  const totalSteps = state.operations.length;
  const canAdvance = state.status === "running" && currentStep < totalSteps;
  const latestLog = state.operationLog[state.operationLog.length - 1];

  function startWithInput(input = state.input) {
    if (input !== state.input) dispatch({ type: "input", input });
    dispatch({ type: "start" });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startWithInput();
  }

  return (
    <main className="min-h-screen bg-background pb-16 text-foreground">
      <header className="border-b border-border/80 bg-surface/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="DSA Studio home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ArrowLeftRight aria-hidden="true" className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-normal">DSA Studio</span>
              <span className="block text-xs text-muted-foreground">Interactive lessons</span>
            </span>
          </a>
          <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            DATA STRUCTURES · 01
          </span>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="pb-9 pt-10 sm:pb-11 sm:pt-14" aria-labelledby="page-title">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
            <Sparkles aria-hidden="true" className="size-3.5" />
            STACKS + QUEUES
          </div>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end">
            <div>
              <h1 id="page-title" className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                Is your word a <span className="text-primary">palindrome?</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Watch two classic data structures process the same text—and see how their outputs reveal the answer.
              </p>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-accent pl-4 text-sm leading-6 text-muted-foreground">
              <span className="font-mono text-xs font-bold text-primary">LIFO</span>
              <span>meets</span>
              <span className="font-mono text-xs font-bold text-violet">FIFO</span>
              <ArrowRight aria-hidden="true" className="ml-auto size-4 text-muted-foreground" />
            </div>
          </div>
        </section>

        <section className="border-y border-border py-6" aria-label="Palindrome input">
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="sr-only" htmlFor="palindrome-input">Enter a word, number, or phrase</label>
            <Input
              id="palindrome-input"
              value={state.input}
              onChange={(event) => dispatch({ type: "input", input: event.target.value })}
              placeholder="Try a word, number, or phrase…"
              autoComplete="off"
              className="h-12 rounded-xl border-border bg-surface px-4 text-base shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-xl px-6 text-sm font-bold shadow-sm"
            >
              <ArrowLeftRight aria-hidden="true" className="size-4" />
              Check palindrome
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">TRY AN EXAMPLE</span>
            {examples.map((example) => (
              <Button
                key={example}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => startWithInput(example)}
                className="h-8 rounded-full border-border bg-background px-3 font-mono text-xs font-bold hover:border-primary/40 hover:bg-accent"
              >
                {example}
              </Button>
            ))}
          </div>
          {state.status === "empty" && (
            <p role="alert" className="mt-3 text-sm font-medium text-destructive">
              {state.currentExplanation}
            </p>
          )}
        </section>

        <section className="pt-7" aria-label="Stack and queue visualization">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-primary">
                <ArrowDownToLine aria-hidden="true" className="size-4" />
              </span>
              Live visualization
              {state.status !== "idle" && state.status !== "empty" && (
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  STEP {currentStep} / {totalSteps}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canAdvance || state.isPlaying}
                onClick={() => dispatch({ type: "step" })}
                className="rounded-lg border-border bg-surface"
              >
                <ArrowDown aria-hidden="true" className="size-4" />
                Next step
              </Button>
              {state.isPlaying ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: "pause" })}
                  className="rounded-lg border-border bg-surface"
                  aria-label="Pause autoplay"
                >
                  <CirclePause aria-hidden="true" className="size-4" />
                  Pause
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canAdvance}
                  onClick={() => dispatch({ type: "play" })}
                  className="rounded-lg border-border bg-surface"
                  aria-label="Start autoplay"
                >
                  <CirclePlay aria-hidden="true" className="size-4" />
                  Auto play
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: "reset" })}
                className="size-9 rounded-lg text-muted-foreground"
                aria-label="Reset visualization"
                title="Reset visualization"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StructurePanel
              title="Stack"
              subtitle="Last In, First Out"
              marker="LIFO"
              kind="stack"
              characters={state.stack}
              emptyLabel="Push characters to build the stack"
            />
            <StructurePanel
              title="Queue"
              subtitle="First In, First Out"
              marker="FIFO"
              kind="queue"
              characters={state.queue}
              emptyLabel="Enqueue characters to build the queue"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
            <section className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="comparison-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground">STEP-BY-STEP</p>
                  <h2 id="comparison-title" className="mt-1 text-base font-bold">Compare removed characters</h2>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-match" /> Match</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-mismatch" /> Different</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-[minmax(76px,1fr)_24px_minmax(76px,1fr)_minmax(70px,.8fr)] gap-2 border-b border-border pb-2 text-[10px] font-bold text-muted-foreground sm:grid-cols-[minmax(110px,1fr)_32px_minmax(110px,1fr)_minmax(90px,.7fr)]">
                <span>STACK · POP</span><span /><span>QUEUE · DEQUEUE</span><span>RESULT</span>
              </div>
              <div className="max-h-56 min-h-16 overflow-y-auto">
                {state.comparisons.length === 0 ? (
                  <div className="flex min-h-16 items-center text-sm text-muted-foreground">
                    Each pair appears here as it is removed and compared.
                  </div>
                ) : (
                  state.comparisons.map((pair, index) => (
                    <ComparisonRow key={pair.index} pair={pair} rowNumber={index + 1} />
                  ))
                )}
              </div>
            </section>

            <section className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5" aria-label="Current step explanation and result">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Timer aria-hidden="true" className="size-4 text-primary" />
                  WHAT’S HAPPENING
                </div>
                <p aria-live="polite" className="mt-3 min-h-12 text-sm leading-6">
                  {state.currentExplanation}
                </p>
                {latestLog && state.status !== "complete" && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 font-mono text-xs font-bold text-accent-foreground">
                    <span>{latestLog.operation}</span>
                    {latestLog.character && <span className="rounded bg-background px-1.5 py-0.5">{latestLog.character.toUpperCase()}</span>}
                  </div>
                )}
              </div>
              {state.status === "complete" && (
                <div className={`flex items-center gap-3 rounded-xl border p-3 ${state.result ? "border-match/30 bg-match/10" : "border-mismatch/30 bg-mismatch/10"}`} role="status">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${state.result ? "bg-match text-match-foreground" : "bg-mismatch text-mismatch-foreground"}`}>
                    {state.result ? <Check aria-hidden="true" className="size-5" /> : <X aria-hidden="true" className="size-5" />}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">{state.result ? "Palindrome!" : "Not a palindrome!"}</p>
                    <p className="text-xs text-muted-foreground">{state.normalized.length} normalized character{state.normalized.length === 1 ? "" : "s"} checked</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="mt-4 overflow-hidden rounded-xl border border-border bg-surface" aria-labelledby="operation-log-title">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-violet" />
                <h2 id="operation-log-title" className="text-sm font-bold">Operation log</h2>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{state.operationLog.length} operation{state.operationLog.length === 1 ? "" : "s"}</span>
            </div>
            <div className="max-h-52 overflow-y-auto px-4 sm:px-5" aria-live="polite">
              {state.operationLog.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Your operations will appear here as the structures change.</p>
              ) : (
                <ol className="divide-y divide-border">
                  {state.operationLog.map((entry, index) => (
                    <li key={`${entry.step}-${index}`} className="grid grid-cols-[34px_88px_minmax(0,1fr)] items-center gap-2 py-2.5 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{String(entry.step).padStart(2, "0")}</span>
                      <span className="font-mono text-[10px] font-bold text-primary">{entry.operation}{entry.character ? ` ${entry.character.toUpperCase()}` : ""}</span>
                      <span className="text-xs leading-5 text-muted-foreground">{entry.explanation}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </section>

        <section className="pt-12" aria-labelledby="learn-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-[11px] font-bold text-primary">THE BUILDING BLOCKS</p>
              <h2 id="learn-title" className="mt-1 text-xl font-extrabold">Three ideas, one check</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground">Removing characters from opposite ends lets us test whether the text reads the same both ways.</p>
          </div>
          <div className="grid gap-0 sm:grid-cols-3">
            <LearningCard
              number="01"
              title="What is a Stack?"
              rule="LIFO · Last In, First Out"
              body="A linear data structure. Think of plates: the last one placed on top is the first one picked up."
              color="primary"
            />
            <LearningCard
              number="02"
              title="What is a Queue?"
              rule="FIFO · First In, First Out"
              body="A linear data structure. Like a waiting line: the person who arrives first is served first."
              color="violet"
            />
            <LearningCard
              number="03"
              title="What is a Palindrome?"
              rule="FORWARD = BACKWARD"
              body="A word, number, or phrase that reads the same in both directions—like MADAM or LEVEL."
              color="primary"
            />
          </div>
          <div className="mt-5 flex gap-3 border-l-2 border-primary pl-4 text-sm leading-6 text-muted-foreground">
            <ArrowLeftRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
            <p><strong className="text-foreground">Why compare them?</strong> A stack reverses the removal order; a queue preserves it. If every character popped from the stack matches the character dequeued from the queue, the input is a palindrome.</p>
          </div>
        </section>

        <footer className="mt-12 border-t border-border pt-5 text-center text-xs text-muted-foreground">
          A hands-on lesson in stacks, queues, and palindrome checking.
        </footer>
      </div>
    </main>
  );
}

function StructurePanel({
  title,
  subtitle,
  marker,
  kind,
  characters,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  marker: "LIFO" | "FIFO";
  kind: "stack" | "queue";
  characters: string[];
  emptyLabel: string;
}) {
  const isStack = kind === "stack";
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface" aria-label={`${title} visualization, ${subtitle}`}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <span className={`flex size-9 items-center justify-center rounded-lg ${isStack ? "bg-accent text-primary" : "bg-violet-soft text-violet"}`}>
            {isStack ? <ArrowDownToLine aria-hidden="true" className="size-4" /> : <ArrowRight aria-hidden="true" className="size-4" />}
          </span>
          <div>
            <h2 className="text-sm font-bold">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${isStack ? "bg-accent text-accent-foreground" : "bg-violet-soft text-violet"}`}>{marker}</span>
      </div>

      {isStack ? (
        <div className="flex min-h-52 flex-col items-center px-5 pb-5 pt-4">
          <div className="mb-2 flex h-5 w-full max-w-[180px] items-center justify-end gap-2 pr-1 font-mono text-[10px] font-bold text-primary">
            {characters.length > 0 ? <><span>TOP</span><ArrowDown aria-hidden="true" className="size-3" /></> : <span className="text-muted-foreground">TOP</span>}
          </div>
          <div className="flex w-full max-w-[180px] flex-1 flex-col-reverse justify-start overflow-y-auto rounded-b-lg border-x-2 border-b-2 border-primary/35 bg-background px-3 py-2">
            {characters.length === 0 ? (
              <div className="flex min-h-24 items-center justify-center px-2 text-center text-xs text-muted-foreground">{emptyLabel}</div>
            ) : (
              characters.map((character, index) => {
                const isTop = index === characters.length - 1;
                return (
                  <div key={`${character}-${index}`} className={`character-cell mb-1.5 flex h-9 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-extrabold ${isTop ? "border-primary/35 bg-accent text-primary" : "border-border bg-surface text-foreground"}`}>
                    {character.toUpperCase()}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-52 flex-col justify-center px-4 py-5 sm:px-5">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold">
            <span className={characters.length > 0 ? "text-violet" : "text-muted-foreground"}>FRONT <ArrowRight aria-hidden="true" className="inline size-3" /></span>
            <span className={characters.length > 0 ? "text-violet" : "text-muted-foreground"}><ArrowRight aria-hidden="true" className="inline size-3" /> REAR</span>
          </div>
          <div className="flex min-h-[72px] w-full items-center gap-2 overflow-x-auto rounded-lg border border-violet/25 bg-violet-soft/45 px-3 py-3">
            {characters.length === 0 ? (
              <p className="w-full text-center text-xs text-muted-foreground">{emptyLabel}</p>
            ) : (
              characters.map((character, index) => (
                <div key={`${character}-${index}`} className={`character-cell flex size-11 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-extrabold ${index === 0 ? "border-violet/40 bg-background text-violet" : "border-border bg-surface text-foreground"}`}>
                  {character.toUpperCase()}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            {characters.length > 0 ? <><span className="font-mono font-bold text-violet">FRONT leaves first</span><ArrowRight aria-hidden="true" className="size-3" /><span>REAR joins last</span></> : <span>First in line is first out</span>}
          </div>
        </div>
      )}
    </section>
  );
}

function ComparisonRow({ pair, rowNumber }: { pair: CharacterComparison; rowNumber: number }) {
  const compared = pair.matches !== null;
  const tone = pair.matches === true ? "match" : pair.matches === false ? "mismatch" : "pending";
  return (
    <div className="grid grid-cols-[minmax(76px,1fr)_24px_minmax(76px,1fr)_minmax(70px,.8fr)] items-center gap-2 border-b border-border/70 py-2 last:border-b-0 sm:grid-cols-[minmax(110px,1fr)_32px_minmax(110px,1fr)_minmax(90px,.7fr)]">
      <span className={`flex h-9 items-center justify-center rounded-md border font-mono text-sm font-extrabold ${pair.stackCharacter ? "border-primary/20 bg-accent text-primary" : "border-border bg-background text-muted-foreground"}`}>
        {pair.stackCharacter?.toUpperCase() ?? <span className="text-xs font-medium">—</span>}
      </span>
      <span className="text-center text-xs text-muted-foreground">↔</span>
      <span className={`flex h-9 items-center justify-center rounded-md border font-mono text-sm font-extrabold ${pair.queueCharacter ? "border-violet/20 bg-violet-soft text-violet" : "border-border bg-background text-muted-foreground"}`}>
        {pair.queueCharacter?.toUpperCase() ?? <span className="text-xs font-medium">—</span>}
      </span>
      <span className={`inline-flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-bold ${compared ? tone === "match" ? "bg-match/10 text-match" : "bg-mismatch/10 text-mismatch" : "bg-muted text-muted-foreground"}`}>
        {compared ? tone === "match" ? <><Check aria-hidden="true" className="size-3" /> MATCH</> : <><X aria-hidden="true" className="size-3" /> DIFFER</> : <span>PAIR {String(rowNumber).padStart(2, "0")}</span>}
      </span>
    </div>
  );
}

function LearningCard({
  number,
  title,
  rule,
  body,
  color,
}: {
  number: string;
  title: string;
  rule: string;
  body: string;
  color: "primary" | "violet";
}) {
  const violet = color === "violet";
  return (
    <article className="border-t border-border px-0 py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0 sm:not-first:border-l">
      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs font-bold ${violet ? "text-violet" : "text-primary"}`}>{number}</span>
        {violet ? <ArrowRight aria-hidden="true" className="size-4 text-violet" /> : <ArrowUp aria-hidden="true" className="size-4 text-primary" />}
      </div>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className={`mt-1.5 font-mono text-[10px] font-bold ${violet ? "text-violet" : "text-primary"}`}>{rule}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}