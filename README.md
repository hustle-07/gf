# 🎡 3D Interactive Carnival Proposal Web App

A production-ready, client-side 3D romantic proposal web application built with Three.js, React Three Fiber, GSAP, and Tailwind CSS. Fully optimized for instant deployment to Netlify.

---

## 🌟 Features & Narrative Flow

1. **Romantic Welcome Splash Screen:**
   - Dark luxury card: *"A Night Out for [HER NAME]"*.
   - Sound unlocking *"Enter Carnival"* button adhering to browser autoplay policies.
   - Built-in name customizer (with live edit and URL query params `?her=Sophia&you=Alex`).

2. **Phase 1: Night Carnival Exploration:**
   - Atmospheric night carnival with cobblestone promenade and starry skybox.
   - Spinning glowing **Carousel** with carved horses and brass poles.
   - Striped **Cotton Candy & Food Stalls** with warm incandescent festoon lights.
   - Neon-lit **Arcade & Game Tents**.
   - Procedural Web Audio romantic waltz music box synthesizer & ambient night crickets.

3. **Phase 2: Boarding The Ferris Wheel:**
   - Interactive boarding button: *"Take a ride with [YOUR NAME] 🎡"*.
   - Camera smoothly glides into the lover's cabin with panoramic glass windows.

4. **Phase 3: The Apex Reveal:**
   - Smooth climb to the highest elevation (~35m).
   - Camera tilts downward overlooking the entire carnival lawn.
   - Emissive neon bulb matrix turns on in a cascading wave, spelling:
     **`"I LOVE YOU [HER NAME] ❤️"`** with dynamic UnrealBloom glow.

5. **Phase 4 & 5: Fireworks & Proposal Dialog:**
   - Multi-stage heart-shaped and trailing particle fireworks burst above the skyline.
   - Glassmorphism proposal card: *"[HER NAME], will you marry me? — [YOUR NAME]"*.
   - Responsive answers: *"Yes! 💖"* and *"A million times yes! 💍"*.
   - Multistage confetti explosions, sparkles, and fanfare.

---

## 🚀 Deployment to Netlify

This project is pre-configured with `netlify.toml` for automatic SPA redirects and asset caching:

### 1. Push to GitHub / GitLab / Bitbucket
```bash
git init
git add .
git commit -m "feat: 3D Carnival Proposal App"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Connect to Netlify
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3. Sharing with Custom Names
You can share direct personalized proposal links with URL query parameters:
```
https://your-site.netlify.app/?her=Emily&you=David
```

---

## 🛠 Tech Stack
- **Framework & Bundler:** Vite + React 18 + TypeScript + Tailwind CSS
- **3D Engine:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Post-Processing:** `@react-three/postprocessing` (UnrealBloomPass, Vignette)
- **Animation Choreography:** GSAP (`gsap`)
- **Audio Engine:** Procedural Web Audio API Synthesizer (Carnival Waltz, Fireworks SFX, Chimes) + Howler
- **Celebration Effects:** `canvas-confetti`
