# Step-by-Step: Build Modal Slides in Framer

## 🎯 WHAT YOU'RE BUILDING

A beautiful slideshow modal that pops up over your aurora background when clicking "About".

**Result:**
- Landing page with aurora video
- "About" button
- Click → Modal slides in
- 6 slides with your info
- Navigate with arrows/dots
- Close button returns to landing

**Time:** 1-2 hours

---

## 📋 STEP-BY-STEP GUIDE

### STEP 1: Prepare Your Landing Page (5 min)

1. Open your **Home** page in Framer
2. Make sure you have:
   - Aurora video background ✅
   - Your logo/name ✅
   - Navigation (you'll add "About" button here)

---

### STEP 2: Create the Modal Container (10 min)

1. **Insert → Frame**
2. Name it: `AboutModal`
3. Set size:
   - Width: `900px`
   - Height: `600px`
4. Position: Center of screen
   - X: Center
   - Y: Center (or 50% from top)
5. Style it:
   - **Fill:** Black `#000000`
   - **Opacity:** 95%
   - **Border Radius:** `20px`
   - **Shadow:** Add drop shadow
     - X: 0, Y: 25, Blur: 50
     - Color: Black, Opacity: 50%

---

### STEP 3: Add Background Overlay (5 min)

Behind the modal, add a dark overlay:

1. **Insert → Frame**
2. Name it: `Overlay`
3. Size: Full screen (100vw × 100vh)
4. Position: Behind modal (send to back)
5. Style:
   - Fill: Black `#000000`
   - Opacity: 70%
6. On Click: Close modal

---

### STEP 4: Create Slide 1 - Hero (15 min)

Inside `AboutModal`:

1. **Add Text:** 
   - "👋 Hi, I'm Alex Goiko"
   - Font: 36px, Bold, White
   - Center aligned

2. **Add Text:**
   - "AI Agentic Systems Engineer | LLM Developer"
   - Font: 20px, Regular, White 90% opacity
   - Center aligned

3. **Add Text (optional):**
   - Your photo from CV
   - Size: 150px × 150px, circular
   - Position: Above name

4. **Add Text:**
   - Your bio paragraph
   - Font: 18px, Regular, White 80% opacity
   - Max width: 600px
   - Center aligned

**Copy content from:** `MODAL_SLIDES_CONTENT.md` → Slide 1

---

### STEP 5: Create Remaining Slides (30 min)

**Option A - Manual (Simpler):**

1. **Duplicate** Slide 1 frame (Cmd+D / Ctrl+D)
2. Rename: `Slide2`, `Slide3`, etc.
3. Replace content with slides 2-6 from `MODAL_SLIDES_CONTENT.md`
4. Stack them horizontally (side by side)
5. Position them so only one is visible at a time

**Option B - Using Scroll Component (Better):**

1. **Insert → Scroll**
2. Set direction: **Horizontal**
3. Add your 6 slide frames inside
4. Enable **Snap to slide**
5. Disable scroll bar (hide it)

---

### STEP 6: Add Navigation Arrows (15 min)

**Left Arrow:**
1. **Insert → Text** (or use icon)
2. Content: `◀` or `←`
3. Size: 40px
4. Position: Left side, middle height
5. Style: White, 40% opacity
6. On Hover: 100% opacity
7. On Click: Scroll to previous slide

**Right Arrow:**
1. Same as left, but:
2. Content: `▶` or `→`
3. Position: Right side
4. On Click: Scroll to next slide

**In Framer:**
- Click arrow → Add interaction → **Scroll to**
- Target: Next/Previous slide
- Animation: Smooth (300ms ease)

---

### STEP 7: Add Navigation Dots (15 min)

At bottom of modal:

1. **Insert → Frame** (for each dot)
2. Size: 10px × 10px
3. Shape: Circle (border radius 50%)
4. Style:
   - Active dot: Purple/Green (your brand)
   - Inactive: White 30% opacity
5. Position: Bottom center, 30px from edge
6. Space them: 10px apart

**Make them interactive:**
- Click dot → Scroll to that slide
- Active slide → Highlight corresponding dot

**In Framer:**
- Use **Variants** to switch active state
- Or manually toggle opacity

---

### STEP 8: Add Close Button (10 min)

1. **Insert → Text** (or Icon)
2. Content: `✕` or `×`
3. Size: 30px
4. Position: Top-right corner
   - 20px from top
   - 20px from right
5. Style:
   - Color: White
   - Opacity: 30%
   - On Hover: 100% opacity
6. On Click: **Hide modal**

---

### STEP 9: Add "About" Button to Landing Page (10 min)

On your **Home** page:

1. Find your navigation area
2. **Insert → Button** (or Text)
3. Content: "About" or "About Me"
4. Style to match your design
5. On Click: **Show AboutModal**

**In Framer:**
- Click button → Add interaction
- Show/Hide: AboutModal
- Animation: Fade in + Scale up
- Duration: 300ms

---

### STEP 10: Add Animations (10 min)

**Modal Entrance:**
1. Select `AboutModal`
2. Set initial state:
   - Opacity: 0
   - Scale: 0.95
   - Position: Center
3. When shown:
   - Opacity: 1
   - Scale: 1
   - Animation: 300ms ease-out

**Modal Exit:**
1. Reverse of entrance
2. Opacity: 0
3. Scale: 0.95
4. Duration: 200ms

**Slide Transitions:**
1. When navigating between slides
2. Slide left/right
3. Duration: 300ms ease-in-out

---

### STEP 11: Make Email Clickable (5 min)

On Slide 6 (Contact):

1. Select email text: `alex@alexgoiko.com`
2. In right panel → **Link**
3. Type: `mailto:alex@alexgoiko.com`
4. Test: Click should open email app!

---

### STEP 12: Make It Responsive (15 min)

**For Mobile:**

1. Select `AboutModal`
2. Add **Breakpoint** → Mobile (< 768px)
3. Adjust:
   - Width: 95vw (instead of 900px)
   - Height: 85vh (instead of 600px)
   - Padding: 30px (instead of 60px)
   - Font sizes: Slightly smaller

**For Swipe Gestures (Mobile):**
1. On mobile, disable arrows
2. Enable swipe: Scroll component already supports this!

---

### STEP 13: Test Everything (10 min)

**Desktop:**
- [ ] Click "About" → Modal appears
- [ ] Click arrows → Slides navigate
- [ ] Click dots → Jump to slides
- [ ] Click X → Modal closes
- [ ] Click overlay → Modal closes
- [ ] Click email → Opens email app
- [ ] Press Esc → Modal closes (if you add keyboard support)

**Mobile:**
- [ ] Click "About" → Modal appears
- [ ] Swipe left/right → Slides navigate
- [ ] Touch target sizes good (min 44px)
- [ ] Fits on screen (no overflow)
- [ ] Close button easy to tap

---

### STEP 14: Publish & Share (5 min)

1. Click **Publish** (top right)
2. Wait for deployment
3. Test on live site: `https://alexgoiko.com`
4. Share with friends!

---

## 🎨 FRAMER-SPECIFIC TIPS

### Using Components:

**Create a Slide Component:**
1. Select your first slide
2. Right-click → **Create Component**
3. Name: `AboutSlide`
4. Now you can reuse this design for all slides!

### Using Variants:

**For Navigation Dots:**
1. Create component with 2 variants:
   - `Active` (full color)
   - `Inactive` (30% opacity)
2. Toggle between them when slide changes

### Using Smart Animate:

For smooth transitions:
1. Create 2 frames (Slide A, Slide B)
2. Make them **Variants** of same component
3. Transition: **Smart Animate**
4. Duration: 300ms
5. Framer automatically animates differences!

---

## 🐛 TROUBLESHOOTING

### Modal Not Showing:
- Check if it's **hidden** initially
- Check **Z-index** (should be on top)
- Check interaction is set correctly

### Slides Not Scrolling:
- Make sure **Scroll component** is set up
- Check direction: Horizontal
- Enable **Snap to slide**

### Animations Janky:
- Reduce animation duration (try 200ms)
- Use **ease-out** for entrances
- Use **ease-in** for exits

### Mobile Layout Broken:
- Check breakpoints are set
- Adjust widths to viewport units (vw, vh)
- Test on real device (Framer preview)

### Can't Click Through Overlay:
- Overlay should be **behind** modal
- Set z-index: Modal = 1000, Overlay = 999

---

## ⚡ ADVANCED: Keyboard Navigation

Want to navigate with arrow keys?

**In Framer:**
1. Add custom code component
2. Listen for keyboard events:
```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    // Go to next slide
  } else if (e.key === 'ArrowLeft') {
    // Go to previous slide
  } else if (e.key === 'Escape') {
    // Close modal
  }
})
```

**Or use Framer's built-in keyboard shortcuts in interactions!**

---

## 📱 MOBILE-FIRST APPROACH

**Build mobile first, then desktop:**

1. Start with mobile layout (390px width)
2. Make it perfect on phone
3. Then add desktop breakpoint
4. Adjust for larger screen

**Why?** Easier to scale up than down!

---

## ✅ FINAL CHECKLIST

### Before Publishing:
- [ ] All 6 slides have content
- [ ] Email is clickable
- [ ] Close button works
- [ ] Navigation arrows work
- [ ] Dots show correct slide
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] No spelling errors
- [ ] Tested on real phone

### After Publishing:
- [ ] Test live site
- [ ] Test on different browsers
- [ ] Test on different devices
- [ ] Get feedback from friends
- [ ] Make improvements

---

## 🚀 YOU'RE READY!

Start with Step 1 and work your way through. Don't try to be perfect on first try - you can always refine later!

**Pro tip:** Build Slide 1 first, get it perfect, then duplicate for other slides. Much faster than building each from scratch!

Good luck! 💪
