/** Operations the learner can advance through one at a time. */
export type VisualizerOperation =
  | { type: "push" | "enqueue"; character: string; index: number }
  | { type: "pop" | "dequeue" | "compare"; index: number };

export type OperationLogEntry = {
  operation: string;
  character?: string;
  explanation: string;
  step: number;
};

export type CharacterComparison = {
  index: number;
  stackCharacter: string | null;
  queueCharacter: string | null;
  matches: boolean | null;
};

export type VisualizerState = {
  input: string;
  normalized: string[];
  operations: VisualizerOperation[];
  cursor: number;
  stack: string[];
  queue: string[];
  comparisons: CharacterComparison[];
  operationLog: OperationLogEntry[];
  currentExplanation: string;
  status: "idle" | "running" | "complete" | "empty";
  result: boolean | null;
  isPlaying: boolean;
};

export type VisualizerAction =
  | { type: "input"; input: string }
  | { type: "start" }
  | { type: "step" }
  | { type: "play" }
  | { type: "pause" }
  | { type: "tick" }
  | { type: "reset" };

/** Ignore spaces/punctuation and case while keeping letters and numbers. */
export function normalizeInput(input: string): string[] {
  return Array.from(input.toLowerCase()).filter((character) => /[\p{L}\p{N}]/u.test(character));
}

/** Build one shared sequence that both manual and automatic playback use. */
export function createOperationPlan(characters: string[]): VisualizerOperation[] {
  const operations: VisualizerOperation[] = [];

  characters.forEach((character, index) => {
    operations.push({ type: "push", character, index });
    operations.push({ type: "enqueue", character, index });
  });

  characters.forEach((_, index) => {
    operations.push({ type: "pop", index });
    operations.push({ type: "dequeue", index });
    operations.push({ type: "compare", index });
  });

  return operations;
}

export function createInitialState(input = ""): VisualizerState {
  return {
    input,
    normalized: [],
    operations: [],
    cursor: 0,
    stack: [],
    queue: [],
    comparisons: [],
    operationLog: [],
    currentExplanation: "Enter a word, number, or phrase to begin.",
    status: "idle",
    result: null,
    isPlaying: false,
  };
}

function runNextOperation(state: VisualizerState, automatic: boolean): VisualizerState {
  const operation = state.operations[state.cursor];
  if (!operation || state.status !== "running") return { ...state, isPlaying: false };

  const step = state.cursor + 1;
  let next: VisualizerState = {
    ...state,
    cursor: step,
    isPlaying: automatic && state.isPlaying,
  };
  let logEntry: OperationLogEntry;

  switch (operation.type) {
    case "push": {
      next = { ...next, stack: [...state.stack, operation.character] };
      logEntry = {
        operation: "PUSH",
        character: operation.character,
        explanation: `${operation.character.toUpperCase()} is placed on top of the stack.`,
        step,
      };
      break;
    }
    case "enqueue": {
      next = { ...next, queue: [...state.queue, operation.character] };
      logEntry = {
        operation: "ENQUEUE",
        character: operation.character,
        explanation: `${operation.character.toUpperCase()} joins the rear of the queue.`,
        step,
      };
      break;
    }
    case "pop": {
      const character = state.stack[state.stack.length - 1] ?? null;
      const comparisons = state.comparisons.map((pair) =>
        pair.index === operation.index ? { ...pair, stackCharacter: character } : pair,
      );
      next = {
        ...next,
        stack: state.stack.slice(0, -1),
        comparisons,
      };
      logEntry = {
        operation: "POP",
        ...(character ? { character } : {}),
        explanation: character
          ? `${character.toUpperCase()} leaves the stack first because it was pushed last.`
          : "The stack is empty, so there is no character to pop.",
        step,
      };
      break;
    }
    case "dequeue": {
      const character = state.queue[0] ?? null;
      const comparisons = state.comparisons.map((pair) =>
        pair.index === operation.index ? { ...pair, queueCharacter: character } : pair,
      );
      next = { ...next, queue: state.queue.slice(1), comparisons };
      logEntry = {
        operation: "DEQUEUE",
        ...(character ? { character } : {}),
        explanation: character
          ? `${character.toUpperCase()} leaves from the front because it was enqueued first.`
          : "The queue is empty, so there is no character to dequeue.",
        step,
      };
      break;
    }
    case "compare": {
      const pair = state.comparisons[operation.index];
      const stackCharacter = pair?.stackCharacter ?? null;
      const queueCharacter = pair?.queueCharacter ?? null;
      const matches = stackCharacter !== null && stackCharacter === queueCharacter;
      const comparisons = state.comparisons.map((currentPair) =>
        currentPair.index === operation.index ? { ...currentPair, matches } : currentPair,
      );
      next = { ...next, comparisons };
      logEntry = {
        operation: "COMPARE",
        explanation: matches
          ? `Both structures returned ${stackCharacter?.toUpperCase()}; this pair matches.`
          : `The returned characters differ (${stackCharacter?.toUpperCase() ?? "—"} and ${queueCharacter?.toUpperCase() ?? "—"}).`,
        step,
      };
      break;
    }
  }

  const isComplete = next.cursor >= next.operations.length;
  const result = isComplete ? next.comparisons.every((pair) => pair.matches === true) : null;
  const finished = isComplete
    ? {
        ...next,
        status: "complete" as const,
        result,
        isPlaying: false,
        currentExplanation: result
          ? "Every stack pop matched the queue dequeue. This is a palindrome."
          : "At least one pair differed. This is not a palindrome.",
      }
    : { ...next, currentExplanation: logEntry.explanation };

  return { ...finished, operationLog: [...state.operationLog, logEntry] };
}

export function visualizerReducer(
  state: VisualizerState,
  action: VisualizerAction,
): VisualizerState {
  switch (action.type) {
    case "input":
      return createInitialState(action.input);
    case "start": {
      const normalized = normalizeInput(state.input);
      if (normalized.length === 0) {
        return {
          ...createInitialState(state.input),
          status: "empty",
          currentExplanation: "Enter at least one letter or number; spaces and punctuation are ignored.",
        };
      }

      const comparisons = normalized.map((_, index) => ({
        index,
        stackCharacter: null,
        queueCharacter: null,
        matches: null,
      }));
      const started: VisualizerState = {
        ...createInitialState(state.input),
        normalized,
        operations: createOperationPlan(normalized),
        comparisons,
        status: "running",
        currentExplanation: `Prepared ${normalized.length} character${normalized.length === 1 ? "" : "s"}. The first character is pushed onto the stack.`,
      };
      return runNextOperation(started, false);
    }
    case "step":
      return { ...runNextOperation(state, false), isPlaying: false };
    case "play":
      return state.status === "running" && state.cursor < state.operations.length
        ? { ...state, isPlaying: true }
        : state;
    case "pause":
      return { ...state, isPlaying: false };
    case "tick":
      return runNextOperation(state, true);
    case "reset":
      return createInitialState(state.input);
  }
}