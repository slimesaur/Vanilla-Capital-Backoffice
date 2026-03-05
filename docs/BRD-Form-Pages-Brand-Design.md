# Business Requirements Document (BRD)
## Vanilla Backoffice — Form Pages Brand Design

**Version:** 1.0  
**Date:** March 5, 2025  
**Status:** Draft  
**Author:** Product / Engineering

---

## CRITICAL: Code Language Convention

**All code must be in English.** Portuguese is only for user-facing display via i18n.

- **Code:** Variables, enum values, object keys, type names, function names — English only
- **Display:** Use i18n keys (e.g., `registration.formSubtitle`) — translations in `src/i18n/translations.ts` provide PT/EN labels

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the requirements for aligning the Registration Form and Suitability Form fill pages with Vanilla Capital's brand design. The primary goal is to improve visual consistency with the rest of the application and elevate the professional appearance of client-facing form pages.

### 1.2 Problem Statement

The form fill pages (Registration and Suitability) currently lack the sidebar present in the rest of the application. The subtitle is generic ("Vanilla Capital") and does not describe the purpose of each questionnaire. The backgrounds are plain without brand-referential visual elements that appear in benchmark materials.

### 1.3 Solution Overview

Three changes will align form pages with the brand:

1. **Add a sidebar with Vanilla logo** to both Registration and Suitability form fill pages (matching the rest of the app)
2. **Update subtitles** to descriptive questionnaire labels
3. **Add diagonal-line background pattern** inspired by benchmark materials (e.g., `public/benchmark/005.png`)

### 1.4 Success Metrics

- Form pages display the Vanilla logo in a sidebar consistent with the main application
- Subtitles clearly describe each questionnaire's purpose
- Background includes subtle diagonal lines pattern that reinforces brand identity
- All user-facing text is localized (EN/PT)

### 1.5 Assumptions

- Form fill pages remain public (no auth); sidebar is for branding only
- Logo assets exist: `/logos/LOGO LIGHT VERSION.svg`, `/logos/LOGO DARK VERSION.svg`
- ThemeContext and LanguageContext are available
- Clients access form pages via shareable links; backoffice navigation is not needed

### 1.6 Dependencies

- Existing `Layout.tsx` for sidebar structure reference
- `SuitabilityFormFill`, `RegistrationFormFill` pages
- i18n infrastructure (`LanguageContext`, `translations.ts`)
- ThemeContext for light/dark logo selection

---

## 2. Scope & Objectives

### 2.1 In Scope

- Sidebar with Vanilla logo on Registration and Suitability form fill pages
- Sidebar visual style matching main app (width, logo placement, theme-aware logo)
- Updated subtitles for both form types
- Diagonal-line background pattern on form page content area
- i18n translations for new subtitle strings (EN/PT)

### 2.2 Out of Scope

- Nav links (Main, Clients, Compliance) on form sidebar — forms are client-facing; backoffice nav not needed
- Changes to form validation, submission logic, or data structures
- Modifications to the main application Layout or other backoffice pages

---

## 3. Detailed Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Vanilla logo shall be displayed in a left sidebar on both Registration and Suitability form fill pages | Must |
| R2 | Sidebar shall match the visual style of the main app sidebar (width, logo placement, theme-aware light/dark logo) | Must |
| R3 | Form title shall remain "Registration Form" / "Suitability Form" | Must |
| R4 | Registration Form subtitle shall be "Client's information registration Questionary" | Must |
| R5 | Suitability Form subtitle shall be "Client's Investments Profile Questionary" | Must |
| R6 | Form page background shall include subtle diagonal lines pattern (inspired by benchmark) | Must |
| R7 | Sidebar shall include theme toggle and language switcher (same as main app sidebar footer) | Must |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR1 | All user-facing text shall be localized (EN/PT) via i18n | Must |
| NFR2 | Diagonal lines shall be subtle and non-distracting; form content shall remain clearly readable | Must |

---

## 4. Appendix A — Translation Keys

| Key | EN | PT |
|-----|----|----|
| `registration.formSubtitle` | Client's information registration Questionary | Questionário de cadastro de informações do cliente |
| `suitabilityFill.formSubtitle` | Client's Investments Profile Questionary | Questionário de perfil de investimentos do cliente |
