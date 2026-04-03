# Chat Streaming Performance Roadmap

## Context

Pretext has been removed from the launch-page app cards.
That screen has a limited number of items, so text precompilation there is not a meaningful performance win.
The real hot path is future chat streaming and long conversation rendering.

This project currently hosts ChatGPT, Claude, and other apps inside Electron `WebContentsView`.
That means the current renderer tree does not own the chat message DOM.
So the roadmap below is ordered for the day we build or intercept a self-owned chat message layer.

## Order

### 1. Reduce streaming commit frequency first

Do not push every token straight into React state.
Accumulate tokens in memory and flush on a frame or small time slice such as 16ms to 33ms.

Target outcome:
- far fewer renders during streaming
- smoother typing effect
- less main-thread churn than token-by-token updates

### 2. Isolate the active streaming message

Keep completed messages frozen.
Only the in-flight assistant message should update during streaming.
Avoid parent-level state shapes that force the whole conversation list to rerender.

Target outcome:
- one hot component instead of a hot entire tree
- lower reconciliation cost
- easier memoization boundaries

### 3. Add conversation virtualization

Once conversations grow large, only render the visible window plus a small overscan.
This should be introduced before fine-grained text layout work, because list size is usually the dominant cost.

Target outcome:
- bounded DOM size
- predictable scroll performance on long chats
- lower memory pressure

### 4. Stabilize scroll anchoring

Auto-follow only when the user is already near the bottom.
When the user scrolls away, suspend follow mode.
When streaming changes height, preserve the anchor instead of forcing a full scroll jump.

Target outcome:
- less scroll jitter
- fewer forced sync layout reads
- better reading experience during streaming

### 5. Introduce text layout precomputation where it actually matters

If we own the message renderer, use text precomputation for:
- message height prediction
- virtualization estimates
- scroll-anchor correction during streaming
- multiline truncation in side panels or compact transcript views

Do not use this as a substitute for render throttling.
Text precomputation reduces layout-measurement pressure; it does not remove DOM writes caused by streaming content updates.

### 6. Split data flow between accumulation and presentation

Maintain an append-only stream buffer separate from the visible committed text.
The renderer should subscribe to the committed view, not the raw token firehose.

Target outcome:
- simpler backpressure control
- easier batching
- cleaner ownership between transport and UI

### 7. Revisit Electron container strategy

As long as third-party chat pages are hosted in `WebContentsView`, most streaming DOM costs stay inside those remote apps.
In that mode, performance work should focus on:
- limiting concurrently active views
- releasing hidden views aggressively
- avoiding unnecessary background activity
- reducing expensive resize/show/hide churn

Only after we own the chat rendering surface does a Pretext-like layer become central.

## Definition Of Done For Phase 1

- launch-page cards use lightweight CSS truncation only
- renderer no longer depends on `@chenglou/pretext`
- chat streaming optimization work starts from render frequency and view ownership, not decorative text measurement
