# Lighthouse Hero Video — HeyGen Prompts

**Purpose:** Silent 15-second website hero background for an investment firm.
**Input image:** `lighthouse_enhanced.png` (coastal cliff lighthouse, rocky terrain, calm sea, soft sky)
**Target end color:** `#F8F6F0` (warm off-white)

---

## How to Use

1. Go to HeyGen > **Image to Video**
2. Upload `lighthouse_enhanced.png` as the source image
3. Paste the **Master Prompt** below into the motion description field
4. Set duration to **15 seconds**
5. Choose **Quality** mode and **1080p** resolution
6. Generate and review against the **Acceptance Checklist** at the bottom

---

## Master Prompt

> Slow, smooth drone orbit circling the lighthouse from a close starting position, gradually pulling back to reveal more of the coastline and open sea. The motion is stable, controlled, and unhurried. Soft natural daylight, gentle cloud movement, calm water. The camera drifts steadily upward and outward. In the final seconds the bright sky and soft clouds naturally fill more of the frame, gently washing the view into a uniform warm off-white tone. The transition is subtle and gradual, as if the camera is simply rising into the luminous sky. Smooth, refined, professional.

---

## Fallback Prompt A — Simpler Motion

Use if the master prompt produces too much movement or visual artifacts.

> Slow, stable drone pullback starting close to the lighthouse, gradually revealing the coastline and sea. Steady, controlled movement. Soft daylight, calm atmosphere. In the final seconds the bright sky gently fills the frame, fading the view into a smooth warm off-white. Subtle, natural, professional.

---

## Fallback Prompt B — Motion Only, No Fade

Use if the off-white fade looks unnatural in generation. Apply the fade in post-production instead.

> Slow, smooth drone orbit around the lighthouse, gradually pulling farther back to reveal the coastline and open sea. Stable, unhurried motion. Soft natural daylight, gentle cloud drift, calm water. Professional and refined.

Then add the `#F8F6F0` fade manually (see Post-Production note below).

---

## Post-Production Fade (if needed)

If no prompt produces a clean fade to `#F8F6F0`, apply it in editing:

- **CapCut (free):** Add a solid color overlay (`#F8F6F0`) on the last 3-4 seconds with opacity easing from 0% to 100%.
- **Canva:** Import the clip, add a white rectangle element on a layer above, animate with "Fade in" timed to the last 3 seconds, set the rectangle color to `#F8F6F0`.
- **Premiere / DaVinci:** Cross-dissolve to a `#F8F6F0` solid on the last 3 seconds.

This gives you full control over the fade timing and guarantees the exact hex color.

---

## Acceptance Checklist

Rate each criterion pass/fail before using the generated clip:

| # | Criterion | Pass? |
|---|-----------|-------|
| 1 | Lighthouse is clearly recognizable in the first 3 seconds | |
| 2 | Camera motion feels slow, stable, and controlled | |
| 3 | More sea and coastline are revealed as the shot progresses | |
| 4 | Overall mood is premium and institutional, not touristic | |
| 5 | No sudden jumps, warping, or visual artifacts | |
| 6 | Final frames transition smoothly toward off-white `#F8F6F0` | |
| 7 | No fantasy, surreal, or trippy visual effects | |
| 8 | Suitable as a silent looping website hero background | |

**If criteria 1-5 and 7-8 pass but 6 fails**, use **Fallback Prompt B** and handle the fade in post-production. This is the most reliable path to the exact `#F8F6F0` ending.

---

## Iteration Guide

| Problem | Fix |
|---------|-----|
| Too much camera motion | Switch to **Fallback A** (pullback only, no orbit) |
| Fade looks surreal or trippy | Switch to **Fallback B** + post-production fade |
| Lighthouse disappears too early | Add "keep the lighthouse visible for the first half of the shot" to the prompt |
| Feels like a travel ad | Remove "coastline" and "ocean" descriptions, keep focus on the lighthouse and sky |
| Motion artifacts or warping | Reduce to "slow, steady pullback" with no orbit |
| Wrong color temperature | Ignore in-video fade entirely; use post-production for guaranteed `#F8F6F0` |
