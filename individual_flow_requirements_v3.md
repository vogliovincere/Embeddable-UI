# Individual Verification Flow — Screen-by-Screen Requirements

**Version:** 2.0
**Date:** March 2026
**Author:** Marco — Product, iAltA Payments
**First client:** Verivend

---

## Purpose

This document captures the screen-by-screen requirements for the individual (solo) verification flow within the embeddable KYC UI that Interro offers to application clients. It reflects the current prototype implementation as iterated with Verivend and supersedes the v1 individual flow requirements.

The individual flow verifies a single natural person. The flow variant is determined by the Context ID selected for the session:

- **KYC Complete** (default): The user provides identity information, address, supplementary documents, and then completes identity verification via the Alloy SDK (document capture + selfie/liveness).
- **KYC Basic**: The user provides identity information, address, supplementary documents, and then manually uploads identity document images within the embeddable UI.

**Key characteristics of the individual flow:**

- Single natural person verified per session.
- The Context ID (KYC Basic or KYC Complete) determines whether the user completes identity verification via the Alloy SDK or uploads identity documents manually.
- Supplementary document collection (proof of address) is a standard step in both variants.
- Host-controlled path selection: Verivend passes `path_type = individual` at session initialization, bypassing the component's type selection screen and sub-selection screen. The component enters the individual flow directly.
- The status screen displays sequential verification of each submitted data category before showing a final result.

---

## Initialization & Configuration

Before the individual flow begins, the host application creates a verification session via Interro's backend API. The initialization contract configures the component's behavior.

### Session Initialization Parameters

| Parameter | Type | When Passed | Notes |
|---|---|---|---|
| Path type | `individual` / `joint` / `entity` | Always | Determines which flow the component loads. When supplied, the component skips its type selection screen (Screen 1) and enters the specified flow directly. |
| Organization ID | String | Always | Links the session to the host application's org record. |
| Authenticated user context | Token / session ref | Always | Component receives auth context from the host; it does not manage login. |
| Pre-fill data | JSON object (optional) | When available | Any person data the host already holds for the user (e.g., name, DOB, address, country) can be passed to pre-populate fields. |
| Context ID | String | Optional | Selects the IDV flow variant. Defaults to `kyc_complete` (Alloy SDK for document capture + selfie). `kyc_basic` collects identity documents within the embeddable UI without the Alloy SDK. |

### Theming

Identical to the entity flow theming specifications. See the entity flow requirements document for the full theming table.

The component renders inline within the host application — embedded in an iframe at `{client}.interro.co`, not redirected to a third-party domain.

---

## Individual Flow — Screen 1: Welcome / Type Selection

> *Shared with Entity and Joint flows.*

Display introductory header text explaining the purpose of KYC verification. A shield icon is displayed above the heading. Below the heading, explanatory text reads: "We need to verify your information before you can proceed. Please select your verification type below."

Two selection buttons are presented with identical styling:

- **Individual** — routes to the individual sub-selection screen.
- **Corporate / Entity** — routes to the entity flow.

### Sub-Selection: Solo vs Joint

After the user selects "Individual," a second selection is presented with a back arrow to return to the primary selection. A person icon is displayed above the heading "Individual Verification" with subtitle: "Select the type of individual verification you need."

- **Solo** — routes to the individual flow (this document).
- **Joint Account** — routes to the joint account flow.

Brief explanatory text accompanies the Joint Account option: *"Select Joint Account if this account has multiple holders who each need to be verified."*

### Terms & Conditions Slide-Up Panel

When the user selects a flow type and has not yet agreed to terms, a slide-up panel appears covering approximately two-thirds of the screen. The panel contains:

- Header: "Before you continue"
- Subheader: "Identity & compliance verification"
- Explanation that the user is about to complete a Know Your Customer (KYC) verification to confirm their identity and comply with anti-money laundering regulations.
- Statement that by continuing, the user agrees to share their information for identity verification, with links to the **Privacy Policy** and **Data Sharing Agreement**.
- Statement that personal information including identification documents and address details will be collected as required by applicable regulations.
- **"I agree"** button to accept and proceed.
- **"Cancel"** button to dismiss the panel.

Clicking the overlay behind the panel also dismisses it.

**Conditional skip:** If the host application passes `path_type = individual` at session initialization, the type selection screen and sub-selection are both bypassed entirely. The user enters the individual flow directly at Screen 2. The user must still agree to the terms and conditions; the consent is surfaced on Screen 4 instead.

---

## Individual Flow — Screen 2: KYC Loading & Sensitive Data Disclaimer

> *Shared with Entity and Joint flows. Identical behavior — see entity flow requirements.*

- Display a loading spinner while the KYC flow initializes (1.5-second simulated load).
- Display configurable client name (e.g., "Verivend") in verification header: "Verivend Verification."
- Display a warning icon in a yellow circle above the heading.
- Display sensitive data warning: informs the user they are about to submit sensitive personal and business data to the named client for the purpose of identity and entity verification.
- Security notice (orange callout box): "If you received a link to this page from a suspicious source, please close this page immediately and do not submit any information."
- Language selector available (e.g., "En").
- Back button to return to previous screen.
- **"Continue"** button to proceed.
- "Powered by" branding footer (configurable per vendor).

---

## Individual Flow — Screen 3: Step Overview

Display a step-by-step summary of the full individual verification flow before the user begins. The heading reads "Individual Verification" with subtitle: "Complete the following steps to verify your identity. You can save progress and return at any time."

**KYC Complete (default):**

- **Step 1:** Provide identity information — Name, date of birth, and tax identifier
- **Step 2:** Provide address information — Current residential address
- **Step 3:** Provide supplementary documents — Proof of address
- **Step 4:** Identity Verification — Photo ID and selfie via secure verification

**KYC Basic:**

- **Step 1:** Provide identity information — Name, date of birth, and tax identifier
- **Step 2:** Provide address information — Current residential address
- **Step 3:** Provide supplementary documents — Proof of address
- **Step 4:** Upload identity documents — Photo ID verification

Each step has an icon and label with a brief description. The step overview dynamically adjusts Step 4's label and description based on the Context ID.

- Back button to return to previous screen.
- Language selector available.
- **"Start verification"** button to begin the flow.

---

## Individual Flow — Screen 4: Privacy & Consent Modal

> *Shared with Entity and Joint flows. Identical behavior — see entity flow requirements.*

Display a modal overlay with privacy/consent disclosures before proceeding.

The modal contains:

- Header: "Privacy & Consent"
- Instructional text: "Before proceeding, please confirm the following:"
- **Checkbox 1:** "I confirm that I have read and understood the Privacy Notice and the Notification to Processing of Personal Data." (Both linked.)
- **Checkbox 2:** "I consent to the processing of my personal data, including biometric data, as described in the Privacy User Acknowledgement and Consent." (Linked.)

Both checkboxes must be checked to enable the proceed button.

- **"Agree and continue"** button (disabled until both checkboxes are checked) to accept and proceed.
- **"Cancel"** button to return to the previous screen.

Clicking the overlay behind the modal also returns to the previous screen.

---

> **Reuse note.** Screens 5 (Identity Information, including SSN) and 6 (Address) are also the entry point for secondary users who arrive via a UBO / Control Person / joint co-holder verification link. In that context they run on Interro's standalone, token-authenticated landing page and must complete **before** Screen 8 (the Alloy SDK in KYC Complete, or the ID country/type + upload screens in KYC Basic). The SDK is never instantiated, and the ID upload screens never render, until a secondary user has successfully submitted both Screen 5 and Screen 6 on the standalone page. See the *Co-Holder Link Landing Flow* (joint requirements) and *UBO / Control Person Link Landing Flow* (entity requirements) for the full sequences per KYC variant.

---

## Individual Flow — Screen 5: Identity Information (Step 1)

Progress bar indicating current step: segment 1 of 4 is active. (If the flow is used within the joint account flow, the progress bar shows 5 segments.)

Back button to return to previous screen. Language selector available.

### Heading

"Identity information" with subtitle: "Please provide your personal details."

### Collect the following fields

- **First name** (text input, required) — placeholder: "Enter first name."
- **Last name** (text input, required) — placeholder: "Enter last name."
- **Email** (email input, required) — placeholder: "email@example.com."
- **Phone number** (tel input, required) — placeholder: "5551234567." Numeric only, maximum 15 digits. Non-numeric characters are stripped on input.
- **Date of birth** (text input, mm/dd/yyyy format, required) — placeholder: "MM/DD/YYYY." Auto-formats as the user types: inserts slashes after month and day digits automatically. Maximum 10 characters.
- **SSN / Tax identifier** (masked input, required) — placeholder: "Enter SSN or tax identifier." Input is masked by default using a masked input component. For US-based users, the field label is "SSN / Tax identifier." For non-US countries, the field label dynamically adjusts to the appropriate tax identifier terminology for the selected country.

A "Required fields" indicator is displayed at the bottom of the form.

If the host application supplied pre-fill data at session initialization, those fields are pre-populated but remain editable. SSN / Tax identifier is never pre-filled.

### Field-Level Validation

Required fields show red border and "This field is required" error text when left empty on submit.

### Constraint to proceed

All required fields (first name, last name, email, phone number, date of birth, SSN / tax identifier) must pass validation.

- **"Save and continue"** button to proceed. Displays a loading animation (rotating dot ellipsis) while processing.

### Persistence

On "Save and continue," the step data is durably saved server-side. SSN / Tax identifier is encrypted at rest. If the user navigates away, logs out, or switches devices, they resume at this point with all data intact. The SSN / Tax identifier is displayed in its masked state on resume.

---

## Individual Flow — Screen 6: Address Information (Step 2)

Progress bar advances to Step 2 (segments 1–2 of 4 active). If joint flow, segments 1–2 of 5.

Back button to return to previous screen. Language selector available.

### Heading

"Address information" with subtitle: "Please provide your current residential address."

### Collect the following fields

- **Country** (dropdown, required) — opens as a modal/overlay with search bar, scrollable list of countries with flag icons, real-time filtering, close (X) button. Placeholder: "Select country."
- **State / Province** (dropdown, conditionally required) — displayed dynamically when the selected country has subdivisions (currently US and Canada). Label adjusts: "State" for US, "Province" for Canada. Opens as a modal/overlay with search bar, scrollable list. Hidden for countries without subdivisions.
- **Street address** (text input, required) — placeholder: "Enter street address."
- **Apartment / Suite / Unit** (text input, optional) — placeholder: "Apt, suite, unit (optional)."
- **City / Town** (text input, required) — placeholder: "Enter city or town."
- **Postal / ZIP code** (text input, required) — placeholder: "Enter postal code." Format validation for US: must match `#####` or `#####-####` pattern. Error: "Enter a valid US ZIP code (e.g., 12345 or 12345-6789)."

A "Required fields" indicator is displayed at the bottom of the form.

If the host application supplied pre-fill data at session initialization, address fields are pre-populated but remain editable.

### Field-Level Validation

Required fields show red border and "This field is required" error text when left empty on submit. Postal code validates format per country.

### Constraint to proceed

All required fields (country, state/province if applicable, street address, city, postal code) must pass validation.

- **"Save and continue"** button to proceed. Displays a loading animation while processing.

### Persistence

On "Save and continue," the step data is durably saved server-side. If the user navigates away, logs out, or switches devices, they resume at this point with all data intact.

---

## Individual Flow — Screen 7: Supplementary Documents (Step 3)

Progress bar advances to Step 3 (segments 1–3 of 4 active). If joint flow, segments 1–3 of 5.

Back button to return to previous screen. Language selector available.

### Heading

"Supplementary documents" with subtitle: "Upload the required documents below. Documents must be dated within the last 3 months."

### Required Document: Proof of Address

#### Header

"Proof of address"

#### Status Indicator

A status icon appears next to the category header:
- Green checkmark (fulfilled) when at least one document has been uploaded.
- Orange warning icon (missing) when no document has been uploaded.

#### Accepted Document Types

The user must first select a document type before uploading. Clicking "+ Select document type" opens a modal with the following options:

- **Utility bill**
- **Bank statement**
- **Government correspondence**

After selecting a document type, an inline upload zone appears for that specific type.

#### Descriptive Text

"Accepted: utility bill, bank statement, or government correspondence."

#### Upload Zone

The upload zone supports:

- Click to choose file or drag and drop.
- Accepted formats: **JPG, PNG, HEIC, WEBP, or PDF**.
- Maximum file size: **10 MB** (configurable per client).
- Documents upload directly to Interro infrastructure — never routed through the host application frontend.
- A "Cancel" link is available to dismiss the upload zone without uploading.

#### Uploaded Documents

Uploaded documents display with:

- Document icon
- Document file name
- Document type label (e.g., "Utility bill")
- Delete (trash) icon to remove the upload

Multiple documents can be uploaded. After uploading one document, the user can click "+ Select document type" again to add additional documents.

#### Validation

If the user attempts to proceed without uploading a document, a validation message appears: "You need to upload at least one document for Proof of address."

### Constraint to proceed

At least one proof of address document must be uploaded.

- **"Continue"** button to proceed. Displays a loading animation while processing.

### Persistence

Each successful upload is durably saved server-side. If the user leaves and returns, previously uploaded documents are shown with their file name and type label.

---

## Individual Flow — Screen 8a: Identity Document — Country & Type Selection (KYC Basic Only — Step 4)

> *Only displayed for KYC Basic flows. Skipped entirely for KYC Complete.*

Progress bar advances to Step 4 (all 4 segments active). If joint flow, segments 1–4 of 5.

Back button to return to previous screen. Language selector available.

### Heading

"Identity document" with subtitle: "Select the issuing country and document type."

### Collect the following fields

- **Issuing country** (dropdown, required) — opens as a modal/overlay with search bar, scrollable list of countries with flag icons, real-time filtering, close (X) button. Placeholder: "Select country."

- **Document type** (radio selection, required) — displayed dynamically after a country is selected. Available document types vary by country:

| Country | Available Document Types |
|---|---|
| United States | ID card, Passport, Driving license |
| United Kingdom | ID card, Passport, Driving license, Residence permit |
| Canada | ID card, Passport, Driving license, Residence permit |
| Australia | ID card, Passport, Driving license |
| Germany | ID card, Passport, Residence permit, Driving license |
| France | ID card, Passport, Residence permit, Driving license |
| Japan | Passport, Residence permit, Driving license |
| Switzerland | ID card, Passport, Residence permit, Driving license |
| Singapore | ID card, Passport |
| India | Passport, Driving license |
| Brazil | ID card, Passport, Driving license |
| Mexico | ID card, Passport, Driving license |
| All other countries (default) | ID card, Passport, Residence permit, Driving license |

Each document type is displayed as a radio button option in a styled card. The selected option has a highlighted border and background.

Changing the issuing country resets the document type selection and clears any previously uploaded document images.

A "Required fields" indicator is displayed at the bottom of the form.

### Field-Level Validation

Required fields show red border and "This field is required" error text when left empty on submit.

### Constraint to proceed

Both issuing country and document type must be selected.

- **"Continue"** button to proceed. Displays a loading animation while processing.

---

## Individual Flow — Screen 8b: Identity Document — Upload (KYC Basic Only — Step 4 continued)

> *Only displayed for KYC Basic flows after country and document type are selected on Screen 8a.*

Progress bar remains on Step 4 (all 4 segments active). If joint flow, segments 1–4 of 5.

Back button returns to the country & type selection screen (Screen 8a). Language selector available.

### Header

Displays the selected country flag and document type name (e.g., "🇺🇸 Driving license") with an edit (pencil) icon to return to the country & type selection screen.

### Instruction

"Ensure all details on the photo are visible and easy to read."

### Upload Zones

The number of upload sides depends on the document type:

| Document Type | Upload Sides |
|---|---|
| Passport | Data page (1 side) |
| ID card | Front side, Back side (2 sides) |
| Driving license | Front side, Back side (2 sides) |
| Residence permit | Front side, Back side (2 sides) |

Each side has its own labeled upload zone:

- Label displayed above the zone (e.g., "Front side," "Back side," "Data page").
- Click to choose file or drag and drop.
- Accepted formats: **JPG, PNG, HEIC, WEBP, or PDF**.
- Maximum file size: **10 MB**.
- Documents upload directly to Interro infrastructure.

#### Uploaded State

Once a file is uploaded for a given side, the upload zone is replaced with a file display showing:

- Document icon
- File name
- Remove (X) button to clear the upload and restore the upload zone

### Field-Level Validation

If a required upload side is missing, the error "Please upload this document" is displayed below the zone.

### Constraint to proceed

All required sides for the selected document type must be uploaded (1 side for Passport, 2 sides for all others).

- **"Upload document"** button to proceed. Displays a loading animation while processing.

### Persistence

Each successful upload is durably saved server-side. If the user leaves and returns, previously uploaded documents are shown.

---

## Individual Flow — Screen 8c: Identity Verification — Alloy SDK (KYC Complete Only — Step 4)

> *Only displayed for KYC Complete flows. Skipped entirely for KYC Basic.*

Progress bar advances to Step 4 (all 4 segments active). If joint flow, segments 1–4 of 5.

Back button to return to previous screen. Language selector available.

### Pre-SDK Explanation Screen

Before launching the SDK, a pre-verification screen is displayed with:

- ID card icon in a blue circle
- Heading: "Identity Verification"
- Instructional text: "Complete your identity verification by following these two steps:"

Two numbered steps displayed in styled cards:

1. **Snap a photo of your ID** — "or upload a document image"
2. **Take a selfie** — "to verify your identity"

### SDK Launch

- **"Begin verification"** button initiates the Alloy SDK.
- The button displays a loading animation while the SDK initializes.
- On error, the button label changes to **"Try again"** and a red error callout displays the error message.

### SDK Initialization

The component initializes the Alloy SDK with:

- SDK API key (from environment configuration)
- Journey token (from environment configuration)
- Evaluation data: first name, last name, date of birth (from Step 1)
- Journey application token (from API call, if available)

Before initializing the SDK, the component attempts to create a journey application via the Alloy API, passing the user's collected data:

- First name, last name, email, phone number
- Date of birth (converted to ISO format)
- SSN (digits only)
- Address (street, city, state abbreviation, postal code, country code) — only included if all primary address fields are populated

If the API call succeeds and the application is not already completed, the journey application token is passed to the SDK. If the API call fails (e.g., CORS, network), the SDK is initialized without it (fallback to SDK-only flow).

### SDK Result Handling

After the SDK completes, the result is interpreted:

- **Completed + Approved:** Success state displayed — green checkmark, "Identity verified," auto-advances to the status screen after 1.2 seconds.
- **Completed + Denied:** Error state — red error callout: "Verification was not approved. Please try again or contact support."
- **Completed + Other (pending review):** Review state — yellow icon, "Under Review," "Your verification is being reviewed. We'll notify you once complete."
- **Closed by user:** Returns to idle state (pre-SDK screen), user can re-initiate.
- **SDK error:** Error state with error message displayed.

### States

The screen has five possible states:

1. **Idle** — Pre-SDK explanation screen with "Begin verification" button.
2. **Loading** — Loading animation while SDK initializes.
3. **Success** — Green checkmark, "Identity verified," auto-advance.
4. **Review** — Yellow icon, "Under Review," notification pending.
5. **Error** — Red callout with error message, "Try again" button.

---

## Individual Flow — Screen 9: Final Verification Status

### Checking Phase (Default)

Displays a loading spinner at the top with heading "Verification Submitted" and subtitle "Please wait while we confirm your submission..."

Below, a checklist of verification items is displayed, each with either a loading spinner (pending) or a green checkmark (verified). Items are verified sequentially with a 1.2-second interval between each:

**KYC Complete:**

1. Identity information
2. Address information
3. Supplementary documents
4. Identity verification

**KYC Basic:**

1. Identity information
2. Address information
3. Supplementary documents
4. Identity documents

After all items are checked, the screen automatically transitions to the submitted state. The checking animation always lands on the submitted state unless the submission itself errors out. There are only two terminal states: submitted successfully, or submission failed.

### Success State (Submitted)

- Success visual — green checkmark icon
- "Verification Submitted" heading
- "Your information has been submitted for review. You may now close this window."

### Failure State (Submission Failed)

- Failure visual — red X icon
- "Submission Failed" heading
- "We were unable to submit your information. Please try again or contact support for assistance."
- **"Try again"** button that retriggers the submission
- Does not specify the reason for failure

---

## Flow Order Summary

### KYC Complete

Screen 1 (Welcome) -> Screen 2 (Disclaimer) -> Screen 3 (Step Overview) -> Screen 4 (Consent) -> Screen 5 (Identity Info) -> Screen 6 (Address) -> Screen 7 (Supplementary Docs) -> Screen 8c (Alloy SDK Verification) -> Screen 9 (Status)

### KYC Basic

Screen 1 (Welcome) -> Screen 2 (Disclaimer) -> Screen 3 (Step Overview) -> Screen 4 (Consent) -> Screen 5 (Identity Info) -> Screen 6 (Address) -> Screen 7 (Supplementary Docs) -> Screen 8a (ID Country & Type) -> Screen 8b (ID Upload) -> Screen 9 (Status)

---

## Cross-Cutting Requirements

> *These requirements are shared across all verification flows (Individual, Joint, Entity). See the entity flow requirements document for the full specification of the following sections:*

### Session Durability

- **Server-side persistence on step completion** — not browser session storage, not localStorage. When a user completes a step, that step's data is durably saved.
- **Cross-device resume** — start on desktop, finish on mobile. Component keyed by external user ID; new token for same user resumes at first incomplete step.
- **No data loss on logout / navigation away** — all previously completed steps survive a full logout/login cycle.
- **Long-lived sessions** — sessions remain resumable for 30 days.

### Progress Visibility Outside the Component

The host application can determine verification progress without loading the embedded component, via:

- **Webhooks** pushed from Interro on step completion (`session.step_completed`, `session.submitted`, `session.screening_completed`, `session.last_activity`)
- **Polling API** — `GET /sessions/{id}/status` returns current progress state

This enables the host to show progress indicators, trigger email campaigns, surface abandoned verifications in admin dashboards, and track time-to-completion and drop-off metrics.

### Returned-for-Corrections Flow

When a host admin or automated screening returns a submission:

- The component supports re-entry in correction mode — loads previously submitted data, flags items that need attention, allows editing.
- Correction guidance is at minimum per-step, ideally per-field with human-readable reasons.
- Two rejection modes: **retry** (user corrects and resubmits) and **final** (rejected, contact support).
- Re-completed flows emit the same `flow:submitted` event for the host to re-process.

### Global UI Requirements

- All "Submit," "Save and continue," "Continue," "Confirm and continue," and similar action buttons display a **loading animation** (rotating dot ellipsis) while the request is being processed.
- Back button is available on all screens except the Welcome screen.
- Language selector ("En") is available on all screens except the Welcome screen.
- "Powered by" branding footer is displayed on every screen.

### Client-Side Events (Component -> Host App)

| Event | When | Payload | Host Action |
|---|---|---|---|
| `step:completed` | User completes a step and data is saved | Step number, step name, completion % | Update progress indicator in host UI |
| `step:navigated` | User navigates between steps | Current step, direction | Analytics |
| `flow:submitted` | User submitted within the component | Reference ID | Trigger retention copy retrieval, update verification lifecycle |
| `flow:resumed` | Component loaded with existing partial data | Resumed step, overall progress | Sync host UI state |
| `document:uploaded` | A document was uploaded | Document type, reference | Track for progress |
| `sdk:initialized` | Alloy SDK loaded (KYC Complete only) | SDK session ref | Track SDK handoff |
| `sdk:completed` | Alloy SDK returned results (KYC Complete only) | Status, reference | Track SDK completion |
| `error` | Validation failure, save failure, SDK error, etc. | Error type, message | Display error or retry |

### Retrieval API

Interro exposes endpoints for the host to retrieve full datasets at any time:

| Data | Endpoint | Format |
|---|---|---|
| Applicant/person data (name, DOB, address, identity) | `GET /sessions/{id}/applicants` | Structured JSON |
| Document images (ID docs, proof of address) | `GET /sessions/{id}/documents/{docId}` | Binary (image/PDF) |
| Document metadata (type, upload date, file info) | `GET /sessions/{id}/documents` | Structured JSON |
| Screening results | `GET /sessions/{id}/screening` | Structured JSON |
| Session progress (step completion, status) | `GET /sessions/{id}/status` | Structured JSON |

### Security & Compliance

- **PII in transit:** TLS required for all communication between component, Interro backend, and host backend.
- **PII at rest:** SSNs, tax identifiers, passport numbers, and identity documents encrypted at rest in Interro's storage. Host encrypts its retention copies using its own encryption pipeline.
- **SSN / Tax identifier handling:** Masked in the UI by default. Never logged in plaintext. Encrypted before persistence. Displayed in masked state on session resume.
- **Document uploads:** Handled directly by the component to Interro infrastructure — never routed through the host frontend.
- **AML/OFAC screening:** Each person independently screened. Results delivered per-person via webhook.
- **Data retention:** Host requires retrieval access for a minimum of 10 years. If Interro purges data on a shorter cycle, the host must be notified in advance.
- **Webhook security:** HMAC signature verification, retry with backoff on delivery failure, idempotency keys.
