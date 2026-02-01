## Premium Artistic Design System

### 🎨 Color Palette

```css
/* Neutrals - Foundation */
--color-black: #0a0a0a           /* Pure black backdrop */
--color-charcoal: #1a1a1a        /* Slightly lighter background */
--color-dark-gray: #2d2d2d       /* Tertiary background */
--color-gray: #555555            /* Medium gray */
--color-light-gray: #888888      /* Light gray for secondary text */
--color-off-white: #f5f3f0       /* Warm cream for primary text */
--color-white: #ffffff           /* Pure white for accents */

/* Primary Accent */
--color-accent: #ff6b35          /* Warm burnt orange - energy & luxury */
--color-accent-light: #ff8c5a    /* Lighter orange for hover states */
--color-accent-dark: #e55a24     /* Darker orange for emphasis */

/* Borders & Support */
--color-muted: #464646           /* Input/form borders */
--color-border: #2a2a2a          /* Card borders */
```

**Rationale:**
- **Dark base** creates a cinematic, intimate atmosphere
- **Burnt orange accent** (#ff6b35) is restrained but commanding—evokes luxury, warmth, and artistic intention
- **Warm off-white** (#f5f3f0) prevents harsh contrast with black, feels more human than pure white
- **No gradients** (except subtle backgrounds)—solid colors feel intentional and premium

---

### 🔤 Typography

```css
/* Font Families */
--font-display: 'Georgia', 'Garamond', serif
--font-body: system fonts (Segoe UI, Helvetica Neue, etc.)
--font-mono: 'JetBrains Mono', 'Courier New'

/* Scale */
--text-h1: clamp(2.5rem, 8vw, 4.5rem)      /* Hero/titles */
--text-h2: clamp(1.75rem, 5vw, 2.5rem)     /* Section titles */
--text-h3: clamp(1.25rem, 4vw, 1.75rem)    /* Subsections */
--text-body: clamp(0.95rem, 2vw, 1.1rem)   /* Body text */
--text-sm: clamp(0.85rem, 1.5vw, 0.95rem)  /* Labels, metadata */
```

**Rationale:**
- **Georgia/Garamond** for display feels editorial, sophisticated, timeless (not trendy)
- **System fonts** for body ensure readability and performance
- **Monospace for passcode input** reinforces security and exclusivity
- **Fluid typography** (clamp) scales beautifully across all devices
- **Tight letter-spacing (-0.3px to -0.8px)** feels intentional, slightly luxe
- **All headings: font-weight 300-400** (not bold) creates elegance, not aggression

---

### ✨ Animation Principles

#### Easing Curves
```javascript
/* All transitions use cubic-bezier(0.25, 0.46, 0.45, 0.94) */
/* This is a "smooth, gentle" curve—not linear, not bouncy */
```

#### Duration Tiers
```css
--transition-fast: 150ms        /* Micro-interactions (hover glow) */
--transition-base: 300ms        /* Primary interactions */
--transition-slow: 500ms        /* Page transitions */
--transition-lazy: 800ms        /* Reveal/entrance animations */
```

#### Motion Philosophy
- **Every movement is purposeful** — no "just because it's cool"
- **Entrance animations stagger** children for a cascade effect
- **Hover effects are subtle** — 2-4px movement max
- **3D effects use transform, not opacity** — more elegant
- **Waveform animation** on audio player feels alive without being distracting

---

### 🎭 Component Design Language

#### PasscodeGate
- **Fullscreen immersive experience** — nothing else visible
- **Ambient background mesh** — slowly shifts, suggests movement without distraction
- **Floating accent element** — soft glow emphasizes accent color
- **Minimal form** — just one input (intentional scarcity)
- **Monospace font** in input field — security, exclusivity
- **Underline animation** — grows as user types (feedback without distraction)
- **No modal/box** — content floats in space
- **Grain overlay** — adds texture, feels handcrafted

#### MediaSection
- **Gallery aesthetic** — not a grid, a collection
- **Video cards** — 16:9 cinematic frames with subtle border
- **Hover depth** — cards lift slightly, glow appears
- **3D tilt on hover** — perspective effect (not spinning, just subtle tilt)
- **Audio cards** — understated, minimal hierarchy
- **Custom audio player** — circular play button, progress bar with gradient
- **Waveform visualization** — animates only during playback

#### Header
- **Sticky, translucent** — glass morphism with backdrop blur
- **Lock button** — minimal, underline on hover (intentional inverse of unlock)
- **Title stays minimal** — "Collection Unlocked" (one-liner)

---

### 🎬 Micro-Interactions

#### Input Focus
```
Border: color-muted → color-accent
Box-shadow: 0 0 20px rgba(255, 107, 53, 0.5)
Background: subtle orange tint
```

#### Button Hover
```
Background: slide-in animation (left to right)
Transform: translateY(-2px)
Box-shadow: 0 12px 24px rgba(255, 107, 53, 0.25)
```

#### Card Hover
```
Border: color-border → color-accent
Box-shadow: glow + depth shadow
Transform: translateY(-4px to -8px)
```

#### Waveform (Audio Player)
Animates in a staggered pattern, heights vary continuously. Only active during playback.

---

### 📐 Spacing & Sizing

```css
/* Consistent scale */
--spacing-xs: 0.5rem
--spacing-sm: 1rem
--spacing-md: 1.5rem
--spacing-lg: 2rem
--spacing-xl: 3rem
--spacing-2xl: 4rem

/* Applied with */
padding: clamp(2rem, 8vw, 4rem)  /* Responsive padding */
gap: clamp(1.5rem, 4vw, 2rem)    /* Responsive gaps */
```

**Rationale:** `clamp()` scales beautifully from mobile to desktop without media queries for every value.

---

### 🌙 Dark Mode Emphasis

- **All backgrounds are pure black or near-black** — no blue/gray tints
- **Off-white text** (#f5f3f0) instead of pure white — less harsh, more sophisticated
- **Orange accent pops** against dark background without feeling jarring
- **Subtle borders** (#2a2a2a) — low contrast but visible
- **Shadows are soft, not harsh** — dark on dark is gentler than light shadows

---

### ♿ Accessibility

- **Color contrast** — off-white on black passes WCAG AA (7.5:1 ratio)
- **Accent color** — sufficient contrast for links, buttons (4.5:1+)
- **Focus states** — glow effect is visible to keyboard users
- **Semantic HTML** — h1, h2, h3 maintain document structure
- **ARIA labels** — on inputs, buttons, audio elements
- **No motion in critical interactions** — animations enhance, don't obscure

---

### 📱 Mobile-First Approach

```css
/* Base styles are mobile-optimized */
font-size: var(--text-body)        /* Readable at 375px */
padding: clamp(1.5rem, 5vw, 2rem)  /* Scales automatically */

/* Minimal breakpoints */
@media (max-width: 768px)          /* Tablets */
@media (max-width: 480px)          /* Small phones */
```

**Key mobile strategies:**
- Single-column layouts (no grid breakpoints required)
- Touch targets: 44px minimum
- Input: 16px font (prevents iOS zoom)
- Simplified header on mobile

---

### 🎯 Design Decisions

#### Why Dark Theme?
Creates intimate, cinematic atmosphere. Premium art/music releases use dark interfaces. Protects user eyes for long viewing.

#### Why Burnt Orange?
- Warm, not cold
- Visible against dark backgrounds
- Associated with luxury (fashion, music, premium brands)
- Restrained—not neon, not aggressive

#### Why Serif for Headlines?
Georgia/Garamond feel editorial, intentional, timeless. They're used by major magazines and premium brands. Avoids generic tech aesthetic.

#### Why No Loading States?
Media loads fast (async API, lazy iframes). If loading is needed, a subtle spinner appears (minimal, elegant).

#### Why Custom Audio Player?
Default HTML5 player looks different on every browser. Custom player matches the aesthetic, gives precise control, feels integrated.

---

### 🚀 Performance Notes

- **No heavy animations** — only transform and opacity (GPU-accelerated)
- **Grain overlay** — uses SVG pattern (single HTTP request, tiny)
- **Lazy loading** — on iframes and images
- **CSS variables** — single source of truth, minimal file size
- **No icon libraries** — inline SVG for play button (crisp, scales)
- **Backdrop filter** — used sparingly (header only)

---

### 📌 Implementation Tips

1. **Colors:** Always use CSS variables (`var(--color-accent)`)
2. **Spacing:** Use `clamp()` instead of fixed px values
3. **Shadows:** Consistent shadow scale from `--shadow-sm/md/lg`
4. **Easing:** All animations use the cubic-bezier curve defined in `:root`
5. **Typography:** Scale with `clamp()` for fluidity
6. **Motion:** Stagger children with 0.15s delay for elegance

---

**Design Philosophy:** This system is restrained, intentional, and human. Every color, font, and motion choice serves the content. The interface disappears—you see the art, not the design.

