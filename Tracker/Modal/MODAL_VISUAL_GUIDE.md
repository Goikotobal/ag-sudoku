# Visual Layout - About Modal

## 🎨 WHAT IT LOOKS LIKE

```
┌─────────────────────────────────────────────┐
│                                             │
│         AURORA BACKGROUND (DIMMED)          │
│                                             │
│    ┌─────────────────────────────────┐     │
│    │                           ✕     │     │ ← Close button
│    │                                 │     │
│    │    👋 Hi, I'm Alex Goiko       │     │
│    │                                 │     │
│    │  AI Agentic Systems Engineer   │     │
│    │       | LLM Developer           │     │
│    │                                 │     │
│    │  [Your bio paragraph here...]  │     │
│    │                                 │     │
│    │                                 │     │
│    │                                 │     │
│    │  ◀                          ▶  │     │ ← Navigation arrows
│    │                                 │     │
│    │     ● ○ ○ ○ ○ ○               │     │ ← Slide dots
│    └─────────────────────────────────┘     │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📐 DIMENSIONS

### Desktop (≥ 768px):
```
Modal: 900px × 600px
Padding: 60px all sides
Content area: 780px × 480px

Close button: 40px × 40px (top-right, 20px margins)
Arrows: 40px (left/right edges)
Dots: 10px each, 10px apart (bottom, 30px from edge)
```

### Mobile (< 768px):
```
Modal: 95vw × 85vh
Padding: 30px all sides
Content area: ~calc(95vw - 60px) × ~calc(85vh - 60px)

Close button: 44px × 44px (larger touch target)
No arrows (swipe instead)
Dots: 12px each (easier to tap)
```

---

## 🔄 SLIDE LAYOUT

### All slides follow same structure:

```
┌─────────────────────────────────────┐
│           [Close ✕]                 │
│                                     │
│        [Icon/Emoji]                 │
│                                     │
│     [Slide Heading]                 │
│                                     │
│  [Content - text/lists/etc]         │
│                                     │
│                                     │
│                                     │
│                                     │
│  ◀                              ▶   │
│           [● ○ ○ ○ ○ ○]           │
└─────────────────────────────────────┘
```

**Consistent spacing:**
- Top: 60px (40px on mobile)
- Sides: 60px (30px on mobile)
- Bottom: 60px (40px on mobile)
- Between elements: 20-30px

---

## 🎬 ANIMATION FLOW

### Opening Modal:

```
Landing Page (with aurora)
           ↓
     [Click "About"]
           ↓
    Overlay fades in (70% black)
           ↓
    Modal scales up (0.95 → 1)
    + fades in (0 → 1)
           ↓
    Modal is visible!
    (300ms total)
```

### Navigating Slides:

```
    Slide 1 visible
           ↓
   [Click right arrow]
           ↓
    Slide 1 slides left
    Slide 2 slides in from right
           ↓
    Slide 2 visible
    (300ms transition)
```

### Closing Modal:

```
    Modal visible
           ↓
  [Click ✕ or Overlay or Esc]
           ↓
    Modal scales down (1 → 0.95)
    + fades out (1 → 0)
           ↓
    Overlay fades out
           ↓
    Back to landing page
    (200ms total)
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (> 768px):
- Fixed size modal (900 × 600)
- Navigation arrows visible
- Hover states on arrows/dots/close
- Click to navigate

### Tablet (768px):
- Slightly smaller modal (90vw × 80vh)
- Still shows arrows
- Touch-friendly sizes
- Swipe also works

### Mobile (< 768px):
- Large modal (95vw × 85vh)
- No arrows (swipe only)
- Larger touch targets (44px min)
- Dots for slide indicator only

---

## 🎨 COLOR SCHEME

```
Modal Background:    rgba(0, 0, 0, 0.95)  Almost black
Overlay:             rgba(0, 0, 0, 0.7)   Dark transparent
Border:              rgba(255, 255, 255, 0.1)  Subtle white

Text Primary:        #FFFFFF               Pure white
Text Secondary:      rgba(255, 255, 255, 0.8)  80% white
Text Tertiary:       rgba(255, 255, 255, 0.6)  60% white

Accent (from aurora): #10b981             Green
Accent 2:            #a855f7              Purple

Active Dot:          #a855f7              Purple
Inactive Dot:        rgba(255, 255, 255, 0.3)  30% white

Arrows Default:      rgba(255, 255, 255, 0.4)  40% white
Arrows Hover:        rgba(255, 255, 255, 1)    100% white
```

---

## 🧩 COMPONENT STRUCTURE

```
Home Page
├── Aurora Video Background
├── Logo/Header
├── Navigation
│   └── About Button ← Triggers modal
│
└── AboutModal (initially hidden)
    ├── Overlay (click to close)
    └── Modal Container
        ├── Close Button (✕)
        ├── Slide Container (horizontal scroll)
        │   ├── Slide 1 - Hero
        │   ├── Slide 2 - What I Do
        │   ├── Slide 3 - Currently
        │   ├── Slide 4 - Projects
        │   ├── Slide 5 - Languages
        │   └── Slide 6 - Contact
        ├── Navigation Arrows (◀ ▶)
        └── Navigation Dots (● ○ ○ ○ ○ ○)
```

---

## ⚙️ STATES

### Modal States:
1. **Hidden** (initial)
   - Opacity: 0
   - Scale: 0.95
   - Pointer events: none

2. **Visible** (shown)
   - Opacity: 1
   - Scale: 1
   - Pointer events: auto

### Slide States:
1. **Active** (current slide)
   - Visible
   - Dot highlighted

2. **Inactive** (other slides)
   - Hidden/off-screen
   - Dots not highlighted

### Button States:
1. **Default**
   - Normal appearance
   - Standard cursor

2. **Hover** (desktop only)
   - Increased opacity/brightness
   - Pointer cursor

3. **Active** (being clicked)
   - Slight scale down (0.98)
   - Quick bounce back

---

## 🔧 FRAMER SETUP

### Create These:

**Frames:**
- `AboutModal` (main container)
- `Overlay` (background dimmer)
- `SlideContainer` (holds all slides)
- `Slide1` through `Slide6`
- `CloseButton`
- `LeftArrow`, `RightArrow`
- `DotNavigation`

**Components (optional but recommended):**
- `SlideTemplate` (reusable slide layout)
- `NavDot` (with Active/Inactive variants)
- `NavArrow` (with enabled/disabled states)

**Interactions:**
- Click "About" → Show modal
- Click Close/Overlay → Hide modal
- Click Arrow → Scroll to slide
- Click Dot → Jump to slide

---

## 📋 COPY-PASTE CHECKLIST

When building in Framer:

- [ ] Copy Slide 1 content from MODAL_SLIDES_CONTENT.md
- [ ] Copy Slide 2 content from MODAL_SLIDES_CONTENT.md
- [ ] Copy Slide 3 content from MODAL_SLIDES_CONTENT.md
- [ ] Copy Slide 4 content from MODAL_SLIDES_CONTENT.md
- [ ] Copy Slide 5 content from MODAL_SLIDES_CONTENT.md
- [ ] Copy Slide 6 content from MODAL_SLIDES_CONTENT.md
- [ ] Make email clickable (mailto:alex@alexgoiko.com)
- [ ] Add your photo (optional, from CV)
- [ ] Test all animations
- [ ] Test on mobile preview

---

## 🎯 QUICK START

**Minimum Viable Modal (30 min):**

1. Create modal frame (900×600, black, rounded)
2. Add Slide 1 content only
3. Add Close button (✕)
4. Add "About" button to landing page
5. Connect: Click About → Show modal
6. Connect: Click ✕ → Hide modal
7. Test!

**Then add more:**
- Other slides (copy & paste Slide 1)
- Navigation (arrows & dots)
- Animations
- Mobile responsive

---

Ready to build? Follow FRAMER_MODAL_GUIDE.md step by step! 🚀
