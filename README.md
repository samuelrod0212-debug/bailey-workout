# Core — Bailey's workout app

A personal, single-user iPhone workout app. Dark mode only, no login, and all data stays on the phone.

Built with **Expo (React Native + TypeScript)**.

> **Status: milestone 1.** The Home and Plan screens are built. Progress, Journal, the workout session and the finish screen come next, once the look is approved.

## Run it

You need Node 20+.

```bash
npm install
npx expo start
```

Then do one of these:

- **On Bailey's iPhone:** install **Expo Go** from the App Store and scan the QR code in the terminal.
- **iOS Simulator (Mac with Xcode):** press `i` in the terminal.
- **In a browser:** press `w`. Add `?demo=1` to the URL to load sample history (this is how the preview screenshots were made). Demo data is never saved.

## Where things live

```
src/
  data/                 ← everything you'll want to edit
    split.ts            weekly split: names, muscles, parts (e.g. Wed = Pull + Run Club), default abs days
    exercises.ts        ⚠️ PLACEHOLDER exercises, sets, reps, rest for each day
    absRoutines.ts      ⚠️ PLACEHOLDER abs circuits A / B / C
    muscles.ts          muscle groups the body map can highlight
    verses.ts           GENERATED: 407 verses (WEB, public domain)
  lib/                  date helpers + schedule logic (status of each day, weekly stats, streak)
  storage/              on-device persistence (AsyncStorage) and app state
  components/           body map, rings, calendar, week strip, cards
  screens/              Home, Plan (Progress and Journal are placeholders for now)
scripts/
  verse-references.txt  the list of verse references
  build-verses.mjs      turns that list into src/data/verses.ts
```

## Edit the split

Open `src/data/split.ts`. Each day has:

- `name` / `focus`: what's shown on the cards
- `muscles`: what lights up on the body map (ids from `muscles.ts`)
- `parts`: the checkable pieces of the day. Wednesday has two (`main` lift + `runclub`). Abs is appended automatically on days she schedules it.

`DEFAULT_ABS_WEEKDAYS` sets the pre-suggested abs days (currently Mon, Wed, Fri). She can change them any week from the Plan tab.

## Replace the exercises

Open `src/data/exercises.ts`. Lists are keyed by `<day id>/<part id>`, for example `push/main` or `pull-runclub/main`:

```ts
'push/main': [
  { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: 120 },
  ...
],
```

Delete `placeholder: true` from anything that's real. `reps` is a string, so ranges like `"8-10"` or `"10 / leg"` work. `rest` is in seconds.

Runs (Run Club, Long Run) are in `RUNS` in the same file.

## Replace the abs routines

Open `src/data/absRoutines.ts`. There are three circuits, used in order through the week: her first abs day of the week gets A, the second gets B, the third gets C. Use `reps` for rep moves or `holdSeconds` for planks and holds.

## Add or change verses

1. Edit `scripts/verse-references.txt` (one reference per line, like `Isaiah 40:31` or `Romans 5:3-4`).
2. Run `npm run verses`.

The script pulls the text from the public-domain World English Bible, merges verses that stop mid-sentence with the next one, skips anything too long for the card, and fails if there are fewer than 366, so every day of the year (including leap years) gets a different verse. The Home screen picks `VERSES[dayOfYear - 1]`, so the verse changes at local midnight.

## Logo and colors

The logo is `assets/05-core-workout-logo.pdf`. It's redrawn as SVG in `src/components/Logo.tsx` and used in the header, the app icon (`assets/icon.png`) and the splash screen (`assets/splash-icon.png`).

Colors come from the logo and are defined in `src/theme.ts` under `brand`: coral `#F04B3A` is the main accent, cream `#F0EFE8` marks abs, and ink `#12151F` is the text on coral buttons.
