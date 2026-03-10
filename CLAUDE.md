# CodeShare — Product Requirements Document

> For Claude Code implementation  
> Target development time: 0.5–1 day

---

## 1. Overview

A link-based code sharing web application where users can write code, save versioned snapshots, and browse history. There is a single screen with a persistent sidebar showing snapshot history. Users write new code via a modal-triggered flow, and snapshots automatically expire 24 hours after creation.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), TypeScript, pnpm |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Database | Firebase Firestore |
| Scheduler | Firebase Cloud Functions (snapshot expiry) |
| Hosting | Vercel |
| Styling | Tailwind CSS, Shadcn |

> **Note:** Firebase Storage is not used. All data is stored directly in Firestore.  
> Recommend enforcing an 80,000 character limit per snapshot to stay within Firestore's 1MB document size limit.  
> Cloud Functions requires Firebase Blaze plan (pay-as-you-go). Actual cost is effectively $0 at this scale, but a credit card must be registered.

---

## 3. Firestore Data Model

Single fixed room via environment variable. Structure supports future multi-room expansion.

```
rooms/{roomId}
  - createdAt: timestamp

rooms/{roomId}/snapshots/{snapshotId}
  - code: string
  - name: string          (user-defined, e.g. "initial draft", "fixed bug")
  - language: string      (e.g. "javascript", "python")
  - fileName: string | null
  - createdAt: timestamp
  - expiresAt: timestamp  (createdAt + 24 hours)
```

Environment variable: `VITE_ROOM_ID` (fixed room ID, e.g. `"main"`)

---

## 4. Routing

```
/       → Single page app (no dynamic routing needed)
```

---

## 5. Layout

Single layout — no mode switching.

```
┌──────────────────────────────────────────────────────────────┐
│  CodeShare          [Default|Latest]  [🌙]  [Copy Code]  [+New] │  ← Header
├─────────────────┬────────────────────────────────────────────┤
│  := Snapshots   │  main.js  ·  fix login bug                │
│                 │  JavaScript  ·  2h ago                     │
│  ● main.js      ├────────────────────────────────────────────┤
│    fix login    │                                            │
│    2h ago       │         Monaco Editor                      │
│  ────────       │                                            │
│    main.js      │   • Read-only when viewing a snapshot      │
│    initial      │   • Editable when writing a new snapshot   │
│    5h ago       │                                            │
│                 │                          [Save] ← editing only│
└─────────────────┴────────────────────────────────────────────┘
                                        [Toast → bottom-right]
```

---

## 6. Feature Specifications

### 6-1. Editor States

The editor has two states:

**Viewing state** (default)
- Monaco Editor is read-only
- Displays the currently selected snapshot from the sidebar
- Active snapshot highlighted in sidebar

**Editing state** (modal)
- Entered via `Ctrl+N` / `Cmd+N` or the **+ New** button
- Monaco Editor becomes editable
- Filename, language dropdown, and description fields appear above the editor
- **Save button** appears in the bottom-right of the editor area
- Modals should have a blurred backdrop overlay.

---

### 6-2. Header Buttons

| Button | Behavior |
|--------|----------|
| **Default \| Latest** toggle | See Section 6-5 |
| **🌙 Theme toggle** | Switch between light and dark theme; persisted in `localStorage` |
| **Copy Code** | Copy current editor content to clipboard; brief visual confirmation |
| **+ New** | Enter editing state (same as `Ctrl+N`) |

---

### 6-3. New Snapshot Flow (`Ctrl+N` / `+ New` button)

1. If currently in **editing state** with unsaved changes → ignore Ctrl+N input

Fields shown above the editor in editing state:
- **Filename** input — on change, auto-detect language from extension and sync language dropdown
- **Language** dropdown — manual override; updates Monaco language immediately
  - Supported extensions: `js`, `jsx`, `ts`, `tsx`, `py`, `java`, `cpp`, `c`, `cs`, `go`, `rs`, `html`, `css`, `json`, `md`, `sh`, `yaml`, `yml`, `sql`
  - Fallback: `plaintext`
- **Description** input — becomes the snapshot name on save

---

### 6-4. Save Snapshot (`Ctrl+S` / `Cmd+S` / Save button)

> Save button is on editing modal. Only visible during editing state.

1. Open save modal
   - Text input pre-filled with the Description field value (if any)
   - Required field — cannot save with empty name
   - Placeholder: "e.g. initial draft"
   - Buttons: **Cancel** / **Save**
2. On confirm:
   - Write snapshot to Firestore with `expiresAt = createdAt + 24h`
   - Return to viewing state, auto-select the new snapshot
   - Show toast: "Snapshot saved: {name}"

---

### 6-5. Snapshot Sidebar

- Lists all snapshots sorted newest first
- Each item shows: filename, snapshot name, snapshot description, relative time (e.g. "2h ago")
  - Absolute timestamp shown on hover as tooltip
- Clicking an item enters viewing state and loads that snapshot
- Currently active snapshot is highlighted

**Default / Latest toggle:**
- **Default:** loads whichever snapshot the user last manually selected; no auto-switching
- **Latest:** always auto-focuses and loads the most recently saved snapshot; updates automatically when a new snapshot is created

---

### 6-6. Copy Code

- **Copy Code button** in header: copies entire current editor content to clipboard
- **`Ctrl+Shift+C` / `Cmd+Shift+C`**: same action via keyboard shortcut
- Visual confirmation on button after copy (e.g. icon change for 1–2 seconds)

---

### 6-7. Snapshot Expiry (24 Hours)

- Each snapshot stores `expiresAt = createdAt + 24h` at save time
- **Firebase Cloud Functions** (Pub/Sub scheduler, runs every hour):
  - Query `rooms/{VITE_ROOM_ID}/snapshots` where `expiresAt < now`
  - Delete all expired snapshot documents
- Expired snapshots disappear from the sidebar on next load

---

## 7. Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` / `Cmd+N` | Enter editing state (confirmation modal if unsaved changes exist) |
| `Ctrl+S` / `Cmd+S` | Open save modal (editing state only) |
| `Ctrl+Shift+C` / `Cmd+Shift+C` | Copy entire editor content to clipboard |

---

## 8. UI Details

### Theme
- **Light theme by default** (`vs-light` + light Tailwind palette)
- **Dark theme opt-in** (`vs-dark` + dark Tailwind palette)
- Preference persisted in `localStorage`

### Toast Notifications
- Fixed bottom-right position
- Auto-dismiss after 2–3 seconds
- Triggers: snapshot saved, code copied

### Modals
- **Save modal:** snapshot name input + Cancel / Save

---

## 9. Implementation Priority

| Priority | Feature |
|----------|---------|
| P0 | Firebase setup + fixed room document |
| P0 | Snapshot sidebar (list, select, highlight) |
| P0 | Monaco editor — viewing state (read-only) |
| P0 | New snapshot flow (`Ctrl+N` / `+ New` button) |
| P0 | Save snapshot modal (`Ctrl+S` / Save button) |
| P0 | Default / Latest toggle |
| P1 | Filename input + language auto-detection + dropdown |
| P1 | Copy Code button + `Ctrl+Shift+C` |
| P1 | Light / dark theme toggle |
| P1 | Relative timestamps + hover tooltip |
| P2 | Cloud Functions scheduled snapshot deletion |

> **Recommended build order:**  
> Firebase setup → sidebar + viewing state → new snapshot flow → save modal → Default/Latest toggle → UI polish → Cloud Functions

---

## 10. Future Considerations (Out of Scope)

- Multi-room support (room creation UI, per-room URLs `/{roomId}`)
- Room-level expiry
- Real-time push notifications when others save a snapshot
- `savedBy` session ID to suppress self-notifications
- Simultaneous collaborative editing (CRDT — consider CodeMirror + Yjs)
- Snapshot diff viewer
- Snapshot author / nickname display
- Password-protected rooms
- Link sharing / Copy Link button

---

## 11. Environment Variables

```bash
# .env
VITE_ROOM_ID=main

# Firebase config
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 12. Firebase & Vercel Setup Notes

```
Required Firebase services:
- Firestore Database
- Cloud Functions (requires Blaze plan)

Hosting:
- Vercel: connect GitHub repo → auto-deploy on push
- No vercel.json config needed for standard React/Vite projects

Firestore security rules (baseline):
- Allow read/write for all users (no auth required)
- Consider rate limiting in a future iteration
```