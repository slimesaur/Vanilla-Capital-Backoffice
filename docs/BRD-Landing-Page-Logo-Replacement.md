# Business Requirements Document (BRD)
## Landing Page Logo Replacement

**Version:** 1.0  
**Date:** March 12, 2025  
**Project:** Vanilla Backoffice / Vanilla Capital Landing Page  

---

## 1. Executive Summary

This BRD outlines the requirements for removing the current logo implementation from the Landing Page Header and Footer, and replacing it with an improved logo solution that supports dark/light mode and better visual fit.

---

## 2. Current State

### 2.1 Logo Placement
- **Header** (`components/Navigation/Header.tsx`): Logo displayed in the top-left, linking to the home page
- **Footer** (`components/Navigation/Footer.tsx`): Logo displayed in the company info section

### 2.2 Current Implementation
- Both Header and Footer use: `/images/VANILLA%20LOGO%20WHITE.svg`
- Single logo variant (white) hardcoded for dark backgrounds
- No theme/light mode support
- Logo SVGs have extra vertical padding (height larger than actual logo content), resulting in excessive whitespace

### 2.3 Files Modified
| File | Change |
|------|--------|
| `components/Navigation/Header.tsx` | Replaced inline logo with `LandingLogo` component |
| `components/Navigation/Footer.tsx` | Replaced inline logo with `LandingLogo` component |
| `components/Navigation/LandingLogo.tsx` | **New** – Theme-aware logo component |
| `public/logo/logo-dark.svg` | **New** – Cropped white logo |
| `public/logo/logo-light.svg` | **New** – Cropped black logo |

---

## 3. Requirements

### 3.1 Removal Phase
- [ ] Remove all logo-related code from `Header.tsx` (lines 45-51: Link + img)
- [ ] Remove all logo-related code from `Footer.tsx` (lines 34-40: Link + img)

### 3.2 New Implementation Phase

#### 3.2.1 Logo Assets
- **Location:** `public/logo/`
- **Variants:** Cropped from `public/images/` with adjusted viewBox (60 250 1500 360)
  - `logo-dark.svg`: White logo (for dark backgrounds / dark theme)
  - `logo-light.svg`: Black logo (for light backgrounds / light theme)

#### 3.2.2 Functional Requirements
- [ ] Add logo to Header with theme-aware switching (dark/light)
- [ ] Add logo to Footer with theme-aware switching (dark/light)
- [ ] Logo must switch based on current theme (dark theme → white logo; light theme → black logo)
- [ ] Use ThemeContext for theme detection (already available via Providers)

#### 3.2.3 Visual Requirements
- [ ] Crop excess top and bottom padding from logo SVGs
- [ ] Logo should better fit the text/visual content within the SVG bounds
- [ ] Maintain consistent sizing: Header (h-14), Footer (h-16)

### 3.3 Technical Approach

#### Logo Cropping
The source SVGs use `viewBox="60 220 1500 420"` with extra vertical space. To crop:
- Adjust viewBox to reduce vertical range (e.g., `60 250 1500 360`)
- Creates tighter fit around the actual logo text/mark

#### Theme Integration
- Use `useTheme()` from ThemeContext (wrapped by root Providers)
- Render appropriate logo: `theme === 'dark'` → white logo; `theme === 'light'` → black logo

---

## 4. Acceptance Criteria

- [ ] No remnants of old logo implementation in Header or Footer
- [ ] Header displays correct logo variant based on theme
- [ ] Footer displays correct logo variant based on theme
- [ ] Logo is properly cropped (reduced top/bottom whitespace)
- [ ] Logo links to home page (`/${locale}`)
- [ ] Alt text: "Vanilla Capital"

---

## 5. Out of Scope

- Backoffice sidebar logo (Layout.tsx, FormLayout.tsx) — unchanged
- Favicon or other branding assets

---

## 6. Dependencies

- ThemeProvider must wrap the application (already in place)
- Logo assets in `public/images/`: VANILLA LOGO WHITE.svg, VANILLA LOGO BLACK.svg
