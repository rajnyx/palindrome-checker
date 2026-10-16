# Palindrome Checker — Stack & Queue Visualizer

## Plan
- Replace the home-page placeholder with a responsive, interactive palindrome checker and dedicated stack, queue, comparison, playback, and learning sections.
- Implement actual beginner-friendly TypeScript LIFO/FIFO operations as one synchronized step sequence; every push, pop, enqueue, dequeue, and comparison updates real state.
- Normalize by removing whitespace and punctuation and converting letters to lowercase; handle empty and single-character inputs correctly.
- Include vertical stack with TOP, horizontal queue with FRONT/REAR, paired comparison results, live operation log, step number, explanations, result, examples, autoplay, pause, and reset.
- Establish a bright blue-and-violet design system, add page-specific metadata, and record the app structure decision in project guidance.
- Verify manual/autoplay/pause/reset and all requested input cases; confirm the preview build succeeds.

## Technical details
Keep the implementation client-side in the existing TanStack home route; no backend, database, authentication, or dependencies are needed. Define shared visual tokens in `src/styles.css` and use semantic styles in the page.
