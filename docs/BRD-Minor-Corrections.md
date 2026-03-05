# Business Requirements Document (BRD)
## Vanilla Backoffice — Minor Corrections Update

**Version:** 1.0  
**Date:** March 5, 2025  
**Status:** Draft  
**Author:** Product / Engineering

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the requirements for a set of **minor corrections** to the Vanilla Backoffice application, focusing on improvements to the Registration Form, Suitability Form, and Client data model.

### 1.2 Scope Overview

| Area | Corrections |
|------|-------------|
| **Registration Form** | Category sections, Spouse RG mask, CEP auto-fill, Bank code as select, Success feedback message |
| **Suitability Form** | Remove approved responses from log, New Suitability Profile attribute |
| **Client Model** | Suitability Profile (Conservative / Moderate / Aggressive) |
| **Clients List & Profile** | Display Suitability Profile |

### 1.3 Success Criteria

- Registration Form displays clear visual sections (Basic Information, Marital Information, Contact Information, Banking Information)
- Marital Information section expands only when client selects "Married"
- Spouse RG field uses RG mask
- CEP triggers address auto-fill upon submission (or on blur)
- Bank code appears as a single-select dropdown with "000 - Bank Name" format
- Registration success screen includes a third message about checking email
- Approved suitability responses disappear from the Submitted Responses log
- Client has a computed Suitability Profile based on weight thresholds
- Suitability Profile is visible in Clients list and profile view

---

## 2. Registration Form Corrections

### 2.1 Category Sections / Segmentation

**Requirement:** The Registration Form must display four major categories, each segmented in a clear, visually distinct way:

1. **Basic Information** — Personal data
2. **Marital Information** — Spouse data (conditional)
3. **Contact Information** — Phone, email, address
4. **Banking Information** — Bank, account details

**Current State:**
- All fields are rendered in a flat list in `RegistrationFormFill.tsx`
- No visual grouping or section headers
- Fields use conditional visibility based on `civilStatus === 'married'`

**Target State:**
- Group fields into four collapsible or visually separated sections
- Each section has a header (translation keys below)
- **Marital Information** must be **collapsed by default** and **expand only when** `civilStatus === 'married'`
- Other sections (Basic, Contact, Banking) may be expanded by default or always visible
- Use visual separation (borders, background, spacing) to distinguish sections

**Field Mapping by Section:**

| Section | Fields |
|---------|--------|
| Basic Information | `name`, `cpf`, `idDocument`, `birthDate`, `civilStatus` |
| Marital Information | `propertyRegime`, `spouseName`, `spouseCpf`, `spouseId`, `spouseBirthDate` |
| Contact Information | `phone`, `email`, `postalCode`, `address`, `addressNumber`, `addressComplement`, `uf`, `city` |
| Banking Information | `bank`, `bankCode`, `accountType`, `agency`, `accountNumber` |

**Implementation Notes:**
- Add `category` or `section` metadata to `registrationFormDefinitions.ts` for each field, or derive from existing order
- Render sections in order; within each section, render only visible fields (respecting `conditional`)
- Marital Information: when `civilStatus !== 'married'`, either hide the entire section or show as collapsed and non-expandable

**Translation Keys (new):**
- `registration.sectionBasicInformation` → EN: "Basic Information", PT: "Informações Básicas"
- `registration.sectionMaritalInformation` → EN: "Marital Information", PT: "Informações Conjugais"
- `registration.sectionContactInformation` → EN: "Contact Information", PT: "Informações de Contato"
- `registration.sectionBankingInformation` → EN: "Banking Information", PT: "Informações Bancárias"

---

### 2.2 Spouse RG Mask

**Requirement:** The Spouse RG field (`spouseId`) must use the same RG mask as the main holder's RG (`idDocument`).

**Current State:**
- `spouseId` in `registrationFormDefinitions.ts` has no mask
- `idDocument` uses `mask: 'rg'`
- `formatRg()` in `src/utils/masks.ts` formats as `XX.XXX.XXX-X` (or similar)

**Target State:**
- Add `mask: 'rg'` to the `spouseId` field definition in `registrationFormDefinitions.ts`
- Ensure `RegistrationFormFill.tsx` applies the RG mask when rendering the `spouseId` input (it should already support `field.mask` in `applyMask` and placeholder)

**Validation:**
- User typing in Spouse RG sees automatic formatting (digits only, with separators)
- Display in client profile (if applicable) shows masked format

---

### 2.3 CEP Auto-Fill (Address Lookup)

**Requirement:** When the CEP (postal code) is submitted (e.g., on blur or after 8 digits entered), the system must fetch the full address from a CEP lookup API and auto-populate: `address`, `uf`, `city`.

**Current State:**
- `postalCode` is a simple text input with CEP mask (`00000-000`)
- No API integration

**Target State:**
- On CEP blur or when 8 digits are present, call a CEP lookup API (e.g., **ViaCEP**: `https://viacep.com.br/ws/{CEP}/json/`)
- Response provides: `logradouro` → `address`, `uf` → `uf`, `localidade` → `city`
- Auto-fill these fields; user may still edit them
- Handle errors (invalid CEP, API unavailable): show optional toast/message, do not block submission
- CEP format for API: digits only (remove mask formatting before fetch)

**API Reference:**
- ViaCEP (free, no auth): `GET https://viacep.com.br/ws/01310100/json/`
- Response: `{ "cep": "01310-100", "logradouro": "Avenida Paulista", "complemento": "", "bairro": "Bela Vista", "localidade": "São Paulo", "uf": "SP", ... }`

**Implementation Notes:**
- Add `useEffect` or `onBlur` handler on postalCode field
- Use `fetch` or equivalent; handle CORS (ViaCEP supports CORS)
- Map `logradouro` → `address`; `localidade` → `city`; `uf` → `uf`
- Optional: show loading state while fetching

**Translation Keys (optional, for errors):**
- `registration.cepInvalid` → EN: "Invalid CEP", PT: "CEP inválido"
- `registration.cepLookupFailed` → EN: "Could not fetch address. Please enter manually.", PT: "Não foi possível buscar o endereço. Preencha manualmente."

---

### 2.4 Bank Code as Single Select (Brazilian Banks)

**Requirement:** The `bankCode` field must **not** appear as a raw text input showing "clients.bankCode" or a numeric-only box. It must be a **single-select** dropdown where options are Brazilian banks in the format **"000 - Bank Name"** (e.g., "208 - BTG Pactual").

**Current State:**
- `bankCode` is a plain `string` field in `registrationFormDefinitions.ts`
- `bank` and `bankCode` are separate fields; both are text inputs
- Client model stores `bank` and `bankCode` separately
- RegistrationFormBuilder maps both to client

**Target State:**
- Replace the `bankCode` input with a `<select>` component
- Options = Brazilian banks list: `{ value: string (code), label: string ("000 - Bank Name") }`
- On selection, store the bank code in `bankCode` and optionally the bank name in `bank` (for display consistency)
- **Recommended:** Use a single field `bankCode` and derive `bank` from the selected option's label (or keep both for backward compatibility)

**Brazilian Banks Data Source:**
- Use official COMPE (FEBRABAN) codes — 3-digit identifiers
- Data sources: BACEN, `datasets-br/bank-codes` (GitHub), `bancos-brasileiros` npm package
- Example entries:
  - `001 - Banco do Brasil`
  - `033 - Santander`
  - `104 - Caixa Econômica Federal`
  - `237 - Bradesco`
  - `341 - Itaú Unibanco`
  - `208 - BTG Pactual`
  - (Full list: 300+ institutions; consider filtering to most common ~50–100 for UX)

**Implementation:**
- Create `src/data/brazilianBanks.ts` (or similar) with array: `{ code: string, name: string }[]`
- Format display: `${code} - ${name}`
- Store `code` in `bankCode`; store `name` (or full string) in `bank` when creating client from response
- Remove or repurpose the standalone `bank` text field — or keep as read-only derived from selection

**Form Definition Update:**
```ts
// registrationFormDefinitions.ts - bankCode field
{
  key: 'bankCode',
  type: 'select',
  required: true,
  labelKey: 'clients.bank',  // or 'clients.bankCode' with proper label
  options: BRAZILIAN_BANKS.map(b => ({ value: b.code, labelKey: null, label: `${b.code} - ${b.name}` })),
}
```
- For selects with static labels (not i18n), use `label` instead of `labelKey`

**Translation:**
- Label: `clients.bank` → "Bank" / "Banco" (single field for bank selection)
- Consider removing `clients.bankCode` as user-facing label; use "Bank" for the select

---

### 2.5 Registration Success Feedback Message

**Requirement:** After the client submits the Registration Form, the success screen must display three messages in sequence:

1. **"Thank you"** (existing: `registration.thankYou`)
2. **"Your registration has been submitted successfully."** (existing: `registration.submittedSuccess`)
3. **New:** A third message instructing the user to check their email for next steps

**Current State:**
- `RegistrationFormFill.tsx` shows:
  - `<h1>{t('registration.thankYou')}</h1>`
  - `<p>{t('registration.submittedSuccess')}</p>`

**Target State:**
- Add a third `<p>` element with a new translation key

**Suggested Wording (English):**
- "Please check your email for next steps."
- or "Keep an eye on your email for the next steps."

**Suggested Wording (Portuguese):**
- "Fique atento ao seu e-mail para os próximos passos."
- or "Acompanhe seu e-mail para as próximas etapas."

**Translation Keys:**
- `registration.checkEmailNextSteps` → EN: "Please check your email for next steps.", PT: "Fique atento ao seu e-mail para os próximos passos."

**Layout:**
- All three messages in the same success container, stacked vertically
- Optional: slightly smaller font for the third message to indicate secondary info

---

## 3. Suitability Form Corrections

### 3.1 Remove Approved Response from Log

**Requirement:** After a suitability response is approved (linked to a client), it must **disappear** from the "Submitted Responses" log in the Suitability Form Builder.

**Current State:**
- `suitabilityStore.ts` has `getResponses(formId)` which returns all responses for that form
- `SuitabilityFormBuilder` displays all responses; there is no filtering by approval status
- Unlike Registration Form, the suitability store does not have an `approveResponse` that marks a response as approved — it simply updates the client
- Responses remain in localStorage and keep appearing in the list

**Target State:**
- When "Approve" is clicked and the client is successfully updated, **remove** that response from the stored responses
- Add `removeResponse(responseId: string)` (or equivalent) to `suitabilityStore.ts`
- Call `removeResponse(r.id)` from `handleApprove` in `SuitabilityFormBuilder` after `updateClient` succeeds
- The response will no longer appear in "Submitted Responses"

**Implementation:**
```ts
// suitabilityStore.ts
export function removeResponse(responseId: string): void {
  const raw = localStorage.getItem(RESPONSES_KEY)
  const all: SuitabilityResponse[] = raw ? JSON.parse(raw) : []
  const filtered = all.filter((r) => r.id !== responseId)
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(filtered))
}
```
- In `SuitabilityFormBuilder.handleApprove`: after `updateClient(...)` and `showToast(...)`, call `removeResponse(r.id)` then `refreshResponses()`

**Note:** This is a **hard delete** — approved responses will not be recoverable from the UI. If audit trail is required later, consider a soft-delete (add `approvedClientId` and filter in `getResponses`). For this BRD, hard delete is acceptable for "disappear from log."

---

### 3.2 Suitability Profile Attribute

**Requirement:** Introduce a new client attribute **Suitability Profile** with three possible values:

| Value (code) | English Label | Portuguese Label | Condition |
|--------------|---------------|------------------|-----------|
| `conservative` | Conservative | Conservador | Summed weight ≤ 26 |
| `moderate` | Moderate | Moderado | Summed weight > 26 and ≤ 44 |
| `aggressive` | Aggressive | Arrojado | Summed weight > 44 |

**Calculation:**
- Based on `totalSuitabilityWeight` (sum of weights from suitability form answers)
- Applied when suitability is approved and `totalSuitabilityWeight` is set on the client

**Type Definition:**
```ts
// src/types/client.ts
export type SuitabilityProfile = 'conservative' | 'moderate' | 'aggressive'

export interface Client {
  // ... existing fields
  suitabilityProfile?: SuitabilityProfile
  totalSuitabilityWeight?: number
  // ...
}
```

**Calculation Logic:**
```ts
function getSuitabilityProfile(totalWeight: number): SuitabilityProfile {
  if (totalWeight <= 26) return 'conservative'
  if (totalWeight <= 44) return 'moderate'
  return 'aggressive'
}
```

**When to Set:**
- In `SuitabilityFormBuilder.handleApprove`, after `calculateSuitabilityWeights`, add:
  - `suitabilityProfile: getSuitabilityProfile(totalSuitabilityWeight)`
- Include in `updateClient` payload

**Display:**
- Clients list: add column for Suitability Profile (translated label)
- Client profile (one-pager): add Suitability Profile in Compliance section (or new Suitability Profile section)

**Translation Keys:**
- `clients.suitabilityProfile` → EN: "Suitability Profile", PT: "Perfil de Suitability"
- `clients.suitabilityProfileConservative` → EN: "Conservative", PT: "Conservador"
- `clients.suitabilityProfileModerate` → EN: "Moderate", PT: "Moderado"
- `clients.suitabilityProfileAggressive` → EN: "Aggressive", PT: "Arrojado"

---

## 4. Clients List & Profile Updates

### 4.1 Clients List Table

**Requirement:** Add a column for **Suitability Profile** to the clients list table.

**Current State:**
- `ClientsPage.tsx` uses `LIST_COLUMN_KEYS` to define table columns
- `suitabilityScore` is already displayed

**Target State:**
- Add `{ key: 'suitabilityProfile', labelKey: 'clients.suitabilityProfile' }` to `LIST_COLUMN_KEYS`
- In `getDisplayValue`, handle `suitabilityProfile` by mapping code to translated label:
  - `conservative` → `t('clients.suitabilityProfileConservative')`
  - `moderate` → `t('clients.suitabilityProfileModerate')`
  - `aggressive` → `t('clients.suitabilityProfileAggressive')`
- Show "-" when `suitabilityProfile` is undefined (client has not completed suitability)

**Optional:** Consider replacing or supplementing `suitabilityScore` column with `suitabilityProfile` if the profile is more meaningful to users. This BRD recommends adding the profile column; keeping the score column is acceptable.

---

### 4.2 Client Profile One-Pager

**Requirement:** Display **Suitability Profile** in the client profile view.

**Current State:**
- Compliance section shows Status, `suitabilityScore`, and optionally `suitabilityAnswers` / `totalSuitabilityWeight`

**Target State:**
- Add an `AttrRow` for Suitability Profile in the Compliance section (or a dedicated "Suitability" subsection)
- Format: `AttrRow label={t('clients.suitabilityProfile')} value={translated profile or '-'}`

---

## 5. Data Model Summary

### 5.1 Client Type Changes

| Field | Type | Description |
|-------|------|-------------|
| `suitabilityProfile` | `'conservative' \| 'moderate' \| 'aggressive'` (optional) | Computed from `totalSuitabilityWeight` when suitability is approved |

### 5.2 Suitability Store Changes

| Function | Change |
|----------|--------|
| `removeResponse(responseId: string)` | New — removes a response from localStorage |

### 5.3 Registration Form Definition Changes

| Field | Change |
|------|--------|
| `spouseId` | Add `mask: 'rg'` |
| `bankCode` | Change to `type: 'select'`, add `options` from Brazilian banks list |
| `bank` | May be derived from bankCode selection or kept as separate (see 2.4) |

---

## 6. Translation Keys Reference

### 6.1 New Keys

| Key | English | Portuguese |
|-----|---------|------------|
| `registration.sectionBasicInformation` | Basic Information | Informações Básicas |
| `registration.sectionMaritalInformation` | Marital Information | Informações Conjugais |
| `registration.sectionContactInformation` | Contact Information | Informações de Contato |
| `registration.sectionBankingInformation` | Banking Information | Informações Bancárias |
| `registration.checkEmailNextSteps` | Please check your email for next steps. | Fique atento ao seu e-mail para os próximos passos. |
| `registration.cepInvalid` | Invalid CEP | CEP inválido |
| `registration.cepLookupFailed` | Could not fetch address. Please enter manually. | Não foi possível buscar o endereço. Preencha manualmente. |
| `clients.suitabilityProfile` | Suitability Profile | Perfil de Suitability |
| `clients.suitabilityProfileConservative` | Conservative | Conservador |
| `clients.suitabilityProfileModerate` | Moderate | Moderado |
| `clients.suitabilityProfileAggressive` | Aggressive | Arrojado |

---

## 7. Implementation Order (Suggested)

1. **Spouse RG mask** — Quick win, minimal changes
2. **Bank code select** — Create Brazilian banks data, update form definition and fill component
3. **CEP auto-fill** — Add ViaCEP integration to RegistrationFormFill
4. **Registration success message** — Add translation and third `<p>` element
5. **Category sections** — Refactor RegistrationFormFill to render sections
6. **Marital expand only when married** — Implement conditional section expansion
7. **Remove approved suitability response** — Add `removeResponse`, call from handleApprove
8. **Suitability Profile** — Add type, calculation, update handleApprove, add to Clients list and profile

---

## 8. Acceptance Criteria Checklist

### Registration Form
- [ ] Form displays four sections: Basic Information, Marital Information, Contact Information, Banking Information
- [ ] Marital Information section is collapsed or hidden when civil status is not "Married"
- [ ] Marital Information expands when civil status is "Married"
- [ ] Spouse RG field uses RG mask (e.g., XX.XXX.XXX-X)
- [ ] Entering CEP and blurring/submitting triggers address lookup; address, city, UF are auto-filled
- [ ] Bank code is a single-select with options in format "000 - Bank Name"
- [ ] Success screen shows: Thank you; Your registration has been submitted successfully.; Please check your email for next steps.

### Suitability Form
- [ ] After approving a suitability response, it no longer appears in Submitted Responses

### Client
- [ ] Client has `suitabilityProfile` set when suitability is approved (Conservative / Moderate / Aggressive)
- [ ] Conservative: total weight ≤ 26
- [ ] Moderate: total weight > 26 and ≤ 44
- [ ] Aggressive: total weight > 44

### Clients List & Profile
- [ ] Clients list has Suitability Profile column (or equivalent visibility)
- [ ] Client profile shows Suitability Profile in Compliance or Suitability section

---

## Appendix A: ViaCEP Response Schema

```json
{
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "complemento": "",
  "bairro": "Bela Vista",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "gia": "1004",
  "ddd": "11",
  "siafi": "7107"
}
```

**Mapping:** `logradouro` → `address`, `localidade` → `city`, `uf` → `uf`

---

## Appendix B: Brazilian Banks Data Source

- **datasets-br/bank-codes**: https://github.com/datasets-br/bank-codes  
  - `bank-codes.csv` or `bcb_listagem.csv` for COMPE codes and bank names
- **BACEN**: Official Central Bank of Brazil list (COMPE codes)
- **bancos-brasileiros** (npm): Pre-packaged list for JavaScript/TypeScript

Recommended: Use a curated list of the most common ~50–80 banks for better UX; full list can be 300+.

---

**End of Document**
