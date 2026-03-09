# About Me - Modal Slides Content

Based on your CV - Ready to copy into Framer!

---

## SLIDE 1 - HERO / INTRO

```
👋 Hi, I'm Alex Goiko

AI Agentic Systems Engineer | LLM Developer

I build intelligent tools and creative AI products that push 
the boundaries of what's possible.

25+ years bridging complex tech innovation with user-centered design.
```

**Design:**
- Large heading
- Your photo (optional - you have one in CV!)
- Centered text
- Animated fade-in

---

## SLIDE 2 - WHAT I DO

```
🤖 What I Do

Specializing in:

• Agentic AI Systems & Multi-Agent Loops
• LLM Integration, Fine-tuning & Prompt Engineering
• RAG (Retrieval-Augmented Generation)
• AI-Powered Products & Interactive Games
• Machine Learning Engineering at Scale

Tools: LangChain, HuggingFace, GPT-4, Claude 3.5, 
Next.js, React, AWS, Docker
```

**Design:**
- Icon: 🤖
- Bullet list (clean, readable)
- Tech stack at bottom (smaller text)

---

## SLIDE 3 - CURRENTLY

```
🚀 Currently Working On

Lead AI Engineer @ Akemis
Building Pilot Barentz - a RAG system for pharmaceutical 
procurement automation

Founder @ Paelletxea
My R&D playground for AI experimentation and innovation

AI Training Specialist @ Outlier/GWS Aligner AI
Refining LLM training datasets and reducing bias
```

**Design:**
- Company names in bold
- Project descriptions below
- Professional but friendly tone

---

## SLIDE 4 - KEY PROJECTS

```
💡 Featured Projects

🔗 CryptoAgents
Autonomous blockchain sentiment & trading agents

🍽️ Restobar GPT
AI assistant for restaurant operations (menus, translation)

🗣️ Lingoka
Language practice assistant with audio simulation

🎮 AG Sudoku
AI-powered Sudoku with smart hints (Try it on this site!)
```

**Design:**
- Emoji icons for each project
- Short descriptions
- Make "AG Sudoku" clickable → /play-sudoku

---

## SLIDE 5 - LANGUAGES & BACKGROUND

```
🌍 Multilingual Engineer

Native: Spanish 🇪🇸 | Basque (Euskera) 🟢⚪🔴
Fluent: English 🇬🇧 | French 🇫🇷
Proficient: Italian 🇮🇹 | Japanese 🇯🇵 (learning)

From industrial operations to AI engineering.
From metal fabrication to pharmaceutical research.
From restaurant management to agentic systems.

Every experience shaped how I build intelligent, 
user-centered solutions today.
```

**Design:**
- Flags for visual interest
- Brief career journey
- Shows versatility

---

## SLIDE 6 - CONTACT (FINAL)

```
📧 Let's Connect

Have an idea, a project, or just want to chat about AI?

alex@alexgoiko.com

I'm always open to interesting conversations 
and collaborations!

🔗 LinkedIn: /alejandro-goicoechea-spain
🐙 GitHub: /Goikotobal
🌐 Website: AlexGoiko.com
```

**Design:**
- Large email (clickable)
- Social links (optional)
- Friendly closing
- CTA: "Send me a message"

---

## NAVIGATION

**Bottom of modal:**
```
◀ Previous    [● ○ ○ ○ ○ ○]    Next ▶
   Slide 1 of 6
```

Or just:
```
[● ○ ○ ○ ○ ○]
```
Dots show which slide you're on.

---

## DESIGN SPECS

### Modal Container:
- Width: 900px (desktop), 90vw (mobile)
- Height: 600px (desktop), 80vh (mobile)
- Background: `rgba(0, 0, 0, 0.95)` (almost black, slightly transparent)
- Border: 1px solid `rgba(255, 255, 255, 0.1)`
- Border radius: 20px
- Box shadow: `0 25px 50px rgba(0, 0, 0, 0.5)`

### Typography:
- Headings: 32px, bold, white
- Body: 18px, regular, `rgba(255, 255, 255, 0.9)`
- Links: Your brand color (purple/teal from aurora)

### Spacing:
- Padding: 60px (desktop), 30px (mobile)
- Line height: 1.6
- Paragraph spacing: 20px

### Animations:
- Modal entrance: Fade in + scale up (0.95 → 1)
- Slide transitions: Slide left/right (300ms ease)
- Close: Fade out + scale down

---

## COLOR PALETTE (Match Aurora)

```css
/* Primary Colors */
Background: #000000 (black)
Text: #FFFFFF (white)
Accent: #10b981 (green - from aurora)
Accent 2: #a855f7 (purple - from your brand)

/* Transparency Layers */
Modal BG: rgba(0, 0, 0, 0.95)
Overlay: rgba(0, 0, 0, 0.7)
Border: rgba(255, 255, 255, 0.1)

/* Buttons */
Primary: linear-gradient(135deg, #10b981, #3b82f6)
Hover: brightness(1.2)
```

---

## INTERACTION STATES

### Close Button (✕):
- Default: White, 30% opacity
- Hover: White, 100% opacity
- Size: 40px × 40px
- Position: Top-right, 20px from edge

### Navigation Arrows:
- Default: White, 40% opacity
- Hover: White, 100% opacity
- Disabled (first/last slide): 20% opacity

### Dots:
- Active: Full color (your brand purple)
- Inactive: 30% opacity
- Hover: 60% opacity

---

## MOBILE CONSIDERATIONS

### Responsive Breakpoints:
- Desktop: > 768px (show arrows + dots)
- Mobile: < 768px (swipe gestures + dots only)

### Mobile-specific:
- Larger touch targets (min 44px)
- Reduce padding (30px instead of 60px)
- Slightly smaller fonts (16px body instead of 18px)
- Full-width modal (95vw)

---

## ACCESSIBILITY

- [ ] Keyboard navigation (Arrow keys, Esc to close)
- [ ] Screen reader friendly (proper ARIA labels)
- [ ] Focus indicators visible
- [ ] Color contrast ratio > 4.5:1
- [ ] Clickable email (mailto:)

---

Ready to build? Start with Slide 1 and add more as you go! 🚀
