# Walkthrough — how this app works, in simple terms

Read this before the interview. Every part is explained as "what it does" and "why it is built that way".

---

## 1. The big picture

The app is a list of **steps**. A step is one dot on the path: either a **lesson** (a video) or a
**quiz**. The course has 3 units; each unit is 5 lessons followed by 1 quiz, so 18 steps in a straight line.

You can only do the **first step you have not finished**. Everything before it is "completed" (done),
that one is "active" (do this next), everything after is "locked". That one rule drives the whole app.

---

## 2. Tools used, and why

| Tool | Why |
|---|---|
| **Expo + React Native** | One codebase for iPhone and Android, quick to run with Expo Go. |
| **TypeScript** | Catches mistakes while typing (wrong names, wrong data shapes). |
| **Expo Router** | Screens are files in `src/app/`. A file named `lesson/[lessonId].tsx` becomes the page `/lesson/u1-l1`. |
| **Reanimated** | Smooth animations that run off the main JavaScript thread, so they don't stutter. |
| **expo-video** | The video player. We draw our own controls on top. |
| **Zustand + AsyncStorage** | Zustand is a tiny "global variable that updates the screen". AsyncStorage saves it on the phone. |
| **react-native-svg** | Draws the dotted curve between lesson dots and all icons. |
| **Jest** | Runs the unit tests. |

---

## 3. Folder tour

```
src/
  app/        the screens (thin: they mostly just put components together)
  components/ reusable building blocks
  hooks/      reusable behaviour (video watching, tab-bar collapse...)
  lib/        the "brain": rules with no screen code in them
  store/      saved data + the toast message
  theme/      colours, fonts, spacing
  data/       courses/*.json  (one file per course: lessons and quiz questions)
  types/      the TypeScript shapes of our data
```

Rule of thumb: **screens are thin, components are reusable, `lib` is testable**.

---

## 4. The data: `data/courses/*.json`

Each file is one course. Units → lessons (title, description, video link) and one quiz (questions with 3 options and the index of
the right one). To add a lesson you edit the file, not the code; to add a whole course, add a JSON file and list it in `lib/content.ts`.
Progress is saved by lesson id (ids are unique across courses), so each course unlocks on its own, while XP, level and streak add up across all of them.
`lib/content.ts` checks the file when the app starts (5 lessons per unit, 3–5 questions, 3 options, safe video links).

---

## 5. The brain: `src/lib/`

- **`curriculum.ts`** — flattens the units into the list of 18 steps and has `computeNodeStates`:
  walk the list, everything done is `completed`, the first not-done is `active`, the rest `locked`.
- **`progress.ts`** — three jobs:
  1. `summarize` calculates XP, level, streak, percent, averages from the saved data.
  2. `applyLessonComplete` / `applyQuizSubmit` are the rules for changing progress
     (refuse locked steps, refuse bad scores, XP only the first time).
  3. `sanitizeProgress` cleans whatever was loaded from the phone (see Security).
- **`gamification.ts`** — level = every 100 XP; streak = consecutive days with activity.
- **`pathLayout.ts`** — pure maths for where each dot sits. The sideways position is a sine wave
  (`sin(index × 1.25)`), which makes the zig-zag. Because every unit has the same height we can
  calculate the exact scroll position of the active lesson — no measuring needed.
- **`security.ts`** — small guards: allowed video links, safe route ids, name cleaning.
- **`haptics.ts`** — tiny vibrations on taps, never crashes if the phone can't.

### The most important idea: save little, calculate the rest

We **save only**: finished lesson ids, best quiz scores, XP-per-day log, name.
We **never save** XP, level, streak, or "this is locked". They are calculated every time.
So they can't get out of sync, and editing the saved file can't unlock lessons.

---

## 6. State: `src/store/`

- **`progressStore.ts`** — Zustand store with `persist` (auto-saves to AsyncStorage).
  Actions: `completeLesson`, `submitQuiz`, `setUserName`, `reset`. The hook `useProgress()` gives screens
  the calculated numbers. When loading from the phone, data goes through `sanitizeProgress` first.
- **`toastStore.ts`** — the little message that slides down ("Өмнөх хичээлээ эхлээд дуусгана уу").
  Any code can call `showToast("...")`.

The app waits on the splash screen until fonts and saved progress are loaded, so you never see a flash of empty state.

---

## 7. Screens (`src/app/`)

- **`_layout.tsx`** (root) — loads fonts, waits for saved data, wraps everything in the error boundary, defines the screen stack and mounts the toast.
- **`(tabs)/_layout.tsx`** — the two tabs, using our own floating tab bar.
- **`(tabs)/index.tsx`** — **Home / Pathway**. Progress strip on top, then a scrolling list of units. Opens scrolled to the active lesson.
- **`(tabs)/profile.tsx`** — **Profile**: avatar, name (editable), level, 6 stat tiles, weekly chart, reset button.
- **`lesson/[lessonId].tsx`** and **`quiz/[quizId].tsx`** — thin routes. Each wraps the real screen in **`StepGate`**.
- **`+not-found.tsx`** — friendly screen for unknown links.

### `StepGate` (the route guard)
Anyone can open `octolearn://lesson/u3-l5` from outside the app. `StepGate` checks: does the id look like an id?
does the step exist? is it unlocked? If not, it shows a message instead of the lesson.

---

## 8. The pathway components (`components/pathway/`)

- **`PathNode`** — one dot. Completed = filled with a check; active = outlined with a play icon, pulsing ring and a bobbing "ЭХЛЭХ" bubble; locked = grey with a lock. Quizzes are rounded squares with a star/trophy so they look different. Tapping a locked dot shakes it and shows the toast. When a dot changes state it "pops".
- **`UnitHeader`** — the coloured banner ("БҮЛЭГ 1 · Танилцах"); grey when locked.
- **`PathUnit`** — a banner plus the dotted curve (SVG) plus the dots. The curve turns purple up to the active dot.
- **`ProgressHeader`** — streak, XP and the course progress bar, always visible. XP/streak "bump" when they change.

---

## 9. The lesson screen

- **`hooks/useLessonPlayback.ts`** — wraps the video player and answers: is it playing? where are we? did it fail? **how much was really watched?**
  Watching is counted in half-second pieces reached by normal playback. A jump (seeking) is detected because the time leaps more than 1.5 s between updates, so seeking to the end doesn't unlock "Дуусгах". Replaying doesn't count twice. The button unlocks at 90%.
- **`VideoPlayer`** — the video plus our own controls: big play/pause, time, seek bar, fullscreen. Controls fade out while playing and return on tap. Shows a spinner while loading and an error card with **Retry** if the video fails.
- **`Scrubber`** — the seek bar, built with React Native's built-in `PanResponder` (tap or drag), 48 dp tall to be easy to hit.
- **`LessonScreen`** — puts it together. On "Дуусгах" it calls the store (+10 XP) and shows the celebration (`ResultView`).

---

## 10. The quiz screen

- **`QuizScreen`** — one question at a time. Pick an option → "Шалгах" → green (right) or red (wrong, and it shows the right answer) → next. After the last question it submits the score once and shows the result. 60% or more passes.
- **`OptionRow`** — one answer. Its colour fades between idle / selected / correct / wrong; correct bounces, wrong shakes.
- **`ResultView`** — the shared celebration screen (badge pops in, texts and buttons rise one after another, optional confetti).

---

## 11. The tab bar (`components/navigation/FloatingTabBar.tsx`)

A pill floating above the bottom edge. Each item's **width is animated**: the active one stretches to reveal its label, others are icon-only.
`hooks/useTabBarCollapse.tsx` holds one shared number (0 = expanded, 1 = collapsed). Home and Profile give their scroll views a handler:
scroll down → 1 (bar shrinks to icons), scroll up or near the top → 0. It only reacts to *finger* scrolling, so the automatic scroll to the active lesson doesn't shrink it.

---

## 12. The reusable UI kit (`components/ui/`)

`AppText` (all text), `Button`, `IconButton`, `Card`, `Pill`, `ProgressBar`, `StatTile`, `Avatar`, `Icon` (SVG set),
`PressableScale` (every tappable thing squishes slightly), `Reveal` (staggered entrance), `Screen` (safe area + background),
`ScreenHeader`, `StateView` (loading / empty / error), `Skeleton`.
This is the DRY part: change a colour or a font once in `theme/` and the whole app follows (including dark mode).

---

## 13. Security in plain words

1. We **don't trust the saved file**: it is cleaned on load, and impossible states are removed.
2. Rules live in the **store**, not only in buttons.
3. **Deep links** can't skip the path (`StepGate`).
4. Video links must be **https and from allowed sites**.
5. The name input is **limited and cleaned**.
6. A crash shows a **friendly screen**, not technical details.
7. Honest limit: a phone app alone can't stop a determined user tampering with their *own* device. Real protection needs a server.

---

## 14. Likely interview questions

- *Why derive instead of saving XP/locks?* So nothing can disagree with itself and tampering with storage can't unlock content.
- *Why Zustand?* Small, no boilerplate, built-in persist; the app has one shared store.
- *How does the zig-zag work?* Sine wave of the step's index for x, fixed row height for y; SVG curves between centres.
- *How do you stop skipping a video to the end?* Count only half-second pieces reached by normal playback; jumps are ignored.
- *How would you add a backend?* Replace the persist storage with API calls in the store actions; keep `lib/` rules, also enforce them on the server.
- *What would you do next?* See README "Not done".
