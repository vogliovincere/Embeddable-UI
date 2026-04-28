# Entity Verification Flow — Screen-by-Screen Requirements

**Version:** 2.0
**Date:** March 2026
**Author:** Marco — Product, iAltA Payments
**First client:** Verivend

---

## Purpose

This document captures the screen-by-screen requirements for the entity verification flow within the embeddable KYC UI that Interro offers to application clients. It reflects the current prototype implementation as iterated with Verivend and supersedes the v1 entity flow requirements.

**Key characteristics of the entity flow:**

- Entity information is collected via manual entry — there is no corporate registry lookup.
- After entity details are entered, the user sees a read-only summary and must explicitly confirm before proceeding.
- A single required document — the entity's formation document — must be uploaded. Additional document types may be configured programmatically by the application client.
- Associated parties are collected in two categories: UBO (Ultimate Beneficial Owner) and Control Person. Exactly one Control Person is required.
- Two-phase associated party model: the authorized representative enters biographical data for each associated person within their own session. Each person then independently completes identity verification via a standalone, token-authenticated link served by Interro outside the host application.
- Host-controlled path selection: Verivend passes `path_type = entity` at session initialization, bypassing the component's type selection screen. The type selection screen remains available as a fallback for clients that prefer to defer path selection to the component.

---

## Initialization & Configuration

Before the entity flow begins, the host application creates a verification session via Interro's backend API. The initialization contract configures the component's behavior.

### Session Initialization Parameters

| Parameter | Type | When Passed | Notes |
|---|---|---|---|
| Path type | `individual` / `joint` / `entity` | Always | Determines which flow the component loads. When supplied, the component skips its type selection screen (Screen 1) and enters the specified flow directly. |
| Organization ID | String | Always | Links the session to the host application's org record. |
| Authenticated user context | Token / session ref | Always | Component receives auth context from the host; it does not manage login. |
| Pre-fill data | JSON object (optional) | When available | Any entity or person data the host already holds (e.g., legal name, country, file number) can be passed to pre-populate fields. |

### Theming

The component accepts brand configuration at initialization:

| Property | Example (Verivend) |
|---|---|
| Primary color | `#0042E0` |
| Accent color | `#008cf0` |
| Text color | `#333D57` |
| Heading color | `#000d2d` |
| Font family | Inter |
| Logo | Supplied by host |
| "Powered by" footer | Configurable per vendor |

The component renders inline within the host application — embedded in an iframe at `{client}.interro.co`, not redirected to a third-party domain.

---

## Entity Flow — Screen 1: Welcome / Type Selection

Display introductory header text explaining the purpose of KYC verification. A shield icon is displayed above the heading. Below the heading, explanatory text reads: "We need to verify your information before you can proceed. Please select your verification type below."

Two selection buttons are presented with identical styling:

- **Individual** — routes to the individual flow (with sub-selection for Solo vs Joint).
- **Corporate / Entity** — routes to the entity flow.

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

**Conditional skip:** If the host application passes `path_type = entity` at session initialization, this screen is bypassed entirely and the user enters the entity flow directly at Screen 2. The user must still agree to the terms and conditions; the consent is surfaced on Screen 4 instead.

---

## Entity Flow — Screen 2: KYB Loading & Sensitive Data Disclaimer

> *Shared with Individual and Joint flows.*

- Display a loading spinner while the KYB flow initializes (1.5-second simulated load).
- Display configurable client name (e.g., "Verivend") in verification header: "Verivend Verification."
- Display a warning icon in a yellow circle above the heading.
- Display sensitive data warning: informs the user they are about to submit sensitive personal and business data to the named client for the purpose of identity and entity verification.
- Security notice (orange callout box): "If you received a link to this page from a suspicious source, please close this page immediately and do not submit any information."
- Language selector available (e.g., "En").
- Back button to return to previous screen.
- **"Continue"** button to proceed.
- "Powered by" branding footer (configurable per vendor).

---

## Entity Flow — Screen 3: Step Overview

Display a step-by-step summary of the full entity verification flow before the user begins:

- **Step 1:** Provide entity details — Company registration information
- **Step 2:** Provide supplementary documents — Signatory list & structure diagram
- **Step 3:** Provide entity documents — Legal and ownership documents
- **Step 4:** Provide associated parties — UBOs, shareholders & directors

Each step has an icon and label with a brief description. The heading reads "Entity Verification" with subtitle: "Complete the following steps to verify your entity. You can save progress and return at any time."

- Back button to return to previous screen.
- Language selector available.
- **"Start verification"** button to begin the flow.

---

## Entity Flow — Screen 4: Privacy & Consent Modal

> *Shared with Individual and Joint flows.*

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

## Entity Flow — Screen 5: Entity Details — Manual Entry (Step 1a)

Progress bar indicating current step: segment 1 of 4 is active.

Back button to return to previous screen. Language selector available.

### Heading

"Entity information" with subtitle: "Please provide your entity's registration details."

### Collect the following fields

- **Country of entity registration** (dropdown, required) — opens as a modal/overlay with search bar, scrollable list of countries with flag icons, real-time filtering, close (X) button, and clear (X) within search input.
- **State** (dropdown, conditionally required) — displayed dynamically only when US is selected as the country. Opens as a modal/overlay with search bar, scrollable list of all US states and territories. Hidden for non-US countries.
- **Entity name** (text input, required) — placeholder: "Enter entity name."
- **File number** (text input, required) — placeholder: "File Number." Helper text below the field: "Can be found on your registration documents you receive from the registrar such as account reminders."

If the host application supplied pre-fill data at session initialization (country, entity name, etc.), those fields are pre-populated but remain editable.

Field-level validation: required fields show red border and "This field is required" error text when left empty on submit. Country-specific conditional fields (e.g., State for US) enforce the same validation.

### Constraint to proceed

All required fields must pass validation. The user cannot advance until Country, Entity name, and File number are populated (plus State if US is selected).

- **"Save and continue"** button to proceed. Displays a loading animation (rotating dot ellipsis) while processing.

### Persistence

On "Save and continue," the step data is durably saved server-side. If the user navigates away, logs out, or switches devices, they resume at this point with all data intact.

---

## Entity Flow — Screen 6: Entity Details — Review & Confirm (Step 1b)

Progress bar remains on Step 1 (segment 1 of 4 active).

Back button returns to the entry form (Screen 5) for edits. Language selector available.

### Heading

"Review entity details" with subtitle: "Please review the entity information below and confirm it is correct."

### Display

All entered entity details displayed in a structured read-only summary:

- **Country of entity registration** — with flag icon
- **State** — only displayed if applicable (i.e., US was selected)
- **Entity name**
- **File number**

Each field displays its label and the user-entered value. If any field was pre-filled by the host application, it is shown here the same as manually entered data.

### Actions

- **"Edit"** button — returns the user to Screen 5 with all fields pre-populated for correction.
- **"Confirm and continue"** button — locks Step 1 data and advances to Step 2. Displays a loading animation while processing.

### Constraint to proceed

The user must explicitly confirm by clicking "Confirm and continue."

### Persistence

On "Confirm and continue," Step 1 is marked complete. The confirmed data is durably saved server-side and a `step:completed` event is emitted to the host application.

---

## Entity Flow — Screen 7: KYB Document Request (Step 2)

Progress bar advances to Step 2 (segments 1–2 of 4 active).

Back button to return to previous screen. Language selector available.

### Heading

"KYB Document Request" with subtitle: "Upload the document establishing your entity's legal existence."

### Guidance Text

Explanatory text identifying the appropriate formation document by entity type:

- **Corporations:** Articles / Certificate of Incorporation
- **LLCs:** Articles / Certificate of Organization
- **Partnerships:** Certificate of Limited Partnership
- **Trusts:** Trust Agreement or Certificate of Trust

### Required Document: Formation Documents

#### Header

"Formation Documents"

#### Status Indicator

A status icon appears next to the category header:
- Green checkmark (fulfilled) when at least one document has been uploaded.
- Orange warning icon (missing) when no document has been uploaded.

#### Validation

If the user attempts to proceed without uploading a document, a validation message appears: "You need to upload at least one document for Formation Documents."

#### Upload Zone

Each document category presents an upload zone supporting:

- Click to choose file or drag and drop.
- Accepted formats: **JPG, PNG, HEIC, WEBP, or PDF**.
- Maximum file size: **10 MB** (configurable per client).
- Documents upload directly to Interro infrastructure — never routed through the host application frontend.

#### Uploaded Documents

Uploaded documents display with:

- Thumbnail preview icon
- Document file name
- Document type label
- Delete (trash) icon to remove the upload

### Additional Configurable Document Types

Beyond the required Formation Documents category, the application client or their client may require additional documents to be collected on this screen. The system must support **programmatic ingestion of additional document type configurations** at session initialization or via client configuration.

Each additional document type configuration includes:

- **Header** — the category name displayed on screen (e.g., "Authorized Signatory List," "Structure Diagram," "Certificate of Good Standing").
- **Subheader** — descriptive text displayed below the category header explaining what should be uploaded (e.g., "Please upload a signed authorized signatory list below," "Please upload a structure diagram outlining the organizational structure and/or ownership structure").

Additional document categories behave identically to the Formation Documents category: they display the same status indicator, upload zone, validation behavior, and uploaded document display. Each additional category requires at least one uploaded document before the user can proceed.

The component must be capable of rendering any number of document categories as specified by the configuration, without requiring code changes.

### Constraint to proceed

The user cannot advance until every document category (Formation Documents plus any additional configured categories) has at least one uploaded document.

- **"Continue"** button to proceed. Displays a loading animation while processing.

### Persistence

Each successful upload is durably saved server-side. If the user leaves and returns, previously uploaded documents are shown with their file name and type label.

---

## Entity Flow — Screen 8: Associated Parties (Step 3)

Progress bar advances to Step 3 (segments 1–3 of 4 active... note: the prototype shows all 4 segments active on this screen as it is the final interactive step before submission).

Back button to return to previous screen. Language selector available.

### Heading

"Associated parties" with subtitle: "Add all associated parties for your entity."

### Associated Party Categories

Two associated party categories are displayed, each with a title, description, and ability to add individuals:

#### UBO (Ultimate Beneficial Owner)

- **Title:** "UBO (Ultimate Beneficial Owner)"
- **Description:** "Individuals with direct or indirect ownership above 25%"
- **"+ Add individual"** link to open the add party form with UBO pre-selected as the default role.
- For each UBO the authorized representative may optionally capture the **percentage of the company owned (directly or indirectly)**. This field is on the add party form and is optional — leaving it blank is permitted. The same field is also offered for Control Persons (see below) so that the form is consistent regardless of role combination.

#### Control Person

- **Title:** "Control Person"
- **Description:** "The single individual with significant responsibility to control, manage, or direct the legal entity"
- **"+ Add individual"** link to open the add party form with Control Person pre-selected as the default role.
- The optional ownership-percentage field is also available for Control Persons (same field as for UBOs). This is intentionally always visible on the form — it does not appear/disappear as the role toggle changes — and can be left blank for Control Persons who do not hold equity.

### Party Cards (Populated State)

Each added party displays as a card showing:

- Person icon
- Full name (first, middle if present, last)
- Email address
- Role badges (e.g., "UBO," "Control Person") — a person may hold multiple roles
- Edit (pencil) icon to modify
- Delete (trash) icon to remove

### Constraint to proceed

- Exactly **one Control Person** is required per 31 CFR 1010.230(d).
- If no Control Person has been added, a validation error is displayed: "Exactly one Control Person is required per 31 CFR 1010.230(d). Please add a Control Person before continuing."
- If more than one Control Person has been added, a validation error is displayed: "Only one Control Person may be designated. Please remove additional Control Persons before continuing."

### Two-Phase Model

This screen implements Phase 1 of the two-phase associated party model: the authorized representative (the Verivend account holder) enters biographical data for each associated person within their own session. Phase 2 (identity verification per person) occurs on Screen 10 via standalone verification links.

### On Submit

- **"Submit"** button triggers a loading animation (rotating dot ellipsis) while processing.
- When the user submits, the component emits a `flow:submitted` event to the host application. This triggers the host's retention copy retrieval and verification lifecycle management. The user advances to Screen 10.

---

## Entity Flow — Screen 9: Add Associated Party — Individual Form

Progress bar shows all 4 segments active (Step 3 context).

Back button returns to the Associated Parties screen (Screen 8). Language selector available.

### Heading

"Add associated party" (or "Edit associated party" when editing an existing entry) with subtitle: "Enter contact details for this person. They will receive a link to provide their own address and verify their identity. If this beneficiary has several roles, you can fill out a questionnaire for them automatically." (When editing: "Update the details for this associated party.")

> **Address and SSN are no longer collected here.** The authorized representative only captures the associated party's name and contact details (plus the optional ownership percentage). The associated party supplies their own SSN / tax identifier and address on the standalone Interro link before any identity-document step runs. See *UBO / Control Person Link Landing Flow* below.

### Role Selection

Role selection via styled checkbox pills. Available roles:

- **UBO**
- **Control Person**

Multiple roles can be selected for the same individual. At least one role must be selected. If the user navigated from a specific category's "+ Add individual" link, that role is pre-selected by default.

Validation: "Select at least one role" if no role is selected on submit.

### Collect the following fields — Identity Information

- **First name** (text input, required)
- **Last name** (text input, required)
- **Middle name** (text input, optional)
- **Date of birth** (text input, mm/dd/yyyy format, required) — with validation error "The date must be valid (mm/dd/yyyy)" for invalid dates.
- **Email** (email input, required) — used to deliver the standalone verification link.
- **Phone number** (tel input, optional) — numeric only, max 15 digits.
- **% of the company owned (directly or indirectly)** (number input, optional, 0–100) — placeholder: "e.g., 25 (optional)." Accepts integers or decimals. Always visible on the form for both UBO and Control Person selections — the field does not appear or disappear as the role toggle changes. Leaving it blank is permitted. If a value is entered, it must be a number between 0 and 100; otherwise the error "Enter a number between 0 and 100" is shown.

### Field-Level Validation

Required fields show red border and "This field is required" error text when left empty on submit. Date field shows format-specific error. Ownership percentage, if supplied, must be numeric and within 0–100.

If any required field is incomplete, a red callout box appears: "Please complete all required fields before submitting."

### Constraint to proceed

All required fields (roles, first name, last name, date of birth, email) must pass validation. Ownership percentage is optional.

- **"Create beneficiary"** button (or **"Update beneficiary"** when editing) to save the associated party. Displays a loading animation while processing.

After saving, the user is returned to the Associated Parties screen (Screen 8) with the newly added/updated party visible in the list.

### Persistence

Each added party is durably saved server-side. If the primary user navigates away and returns, all previously added parties are displayed in the list. Partially completed forms are not saved — only submitted entries persist.

### Note on Additional Persons

The people added here (UBOs, Control Persons) are likely not users of the host application. Their identity verification will happen outside the host app via standalone, token-authenticated links (see Screen 10). The email address collected here is used to deliver those verification links.

---

## Entity Flow — Screen 9b: UBO / Control Person Link Landing Flow (Standalone)

> *This is the experience a UBO or Control Person sees when they open the verification link emailed to them from Screen 10. It runs on Interro's standalone, token-authenticated web page and is served without a host application account. Host branding is preserved.*

### Core principle

The associated party is the authoritative source of their own address and SSN. The Alloy SDK (KYC Complete) and the document upload screens (KYC Basic) **must not render or instantiate** until the party has successfully submitted both their personal info (including SSN) and their address on this standalone page.

### Common sequence (both KYC variants)

1. **Personal Info (Individual flow Screen 5 equivalent)** — first name, last name, email, phone, date of birth, and SSN / tax identifier. Pre-filled with the data the authorized representative captured on Screen 9 (first / middle / last name, DOB, email, phone). **SSN is never pre-filled** — the authorized representative does not collect it on Screen 9; the associated party always enters it themselves here. SSN / tax identifier is required before proceeding.
2. **Address (Individual flow Screen 6 equivalent)** — country, state/province (if US/Canada), street address, apartment (optional), city, postal/ZIP code. Same field behaviour and validation as the individual flow's Screen 6.

The supplementary-docs screen (proof-of-address for the business) is **not** shown to associated parties — only the authorized representative is responsible for that artifact on behalf of the entity.

### KYC Complete branch (after address + SSN are saved)

3. **Alloy SDK (Individual flow Screen 8c equivalent)** — the SDK is instantiated on the same standalone page with the party's biographical data (name, email, DOB) **plus** the address and SSN the party just supplied. The SDK runs document capture and selfie/liveness. Result handling mirrors Screen 8c.
4. **Status / completion** — success, review, denied, or error states. Webhook sent to host.

### KYC Basic branch (after address + SSN are saved)

3. **Identity Document — Country & Type (Individual flow Screen 8a equivalent)** — select country of issuance and document type.
4. **Identity Document — Upload (Individual flow Screen 8b equivalent)** — upload front / back / single image per selected doc type.
5. **Status / completion** — webhook sent to host. The Alloy SDK is **not** used on the party side in KYC Basic; Alloy receives the uploaded documents via server-side submission.

### Acceptance criteria

- The SDK (KYC Complete) and the ID country/type + upload screens (KYC Basic) are gated: they must not render until Personal Info (including SSN) and Address have been persisted server-side for this associated party.
- If the party abandons mid-flow, on resume they return to the first incomplete step with previously saved data intact. SSN appears in its masked form on resume.
- Supplementary-docs screen is skipped for associated parties in both variants.

---

## Entity Flow — Screen 10: Associated Party Verification & Submission Confirmation

Progress bar shows all 4 segments active.

### Heading

"One last step" with subtitle: "To complete your business verification, all associated parties must verify their identity."

### Verification Actions

**"Remind all pending applicants"** button to bulk-notify all unverified parties.

Collapsible **"Verification required"** section showing count of pending verifications (e.g., "3" in a count badge). The section is expanded by default and can be toggled via a chevron icon.

Each associated party listed with:

- Person icon
- Full name
- Role badges (e.g., "UBO," "Control Person")
- Email address
- Three verification options:
    - **"Verify now"** — opens the identity verification flow inline (e.g., via the Alloy SDK for document verification). Available if the party is physically present with the authorized representative.
    - **"Send to email"** — sends the verification link to the party's email address.
    - **"Copy link"** — copies the verification link to clipboard. Displays "Copied!" confirmation for 2 seconds.

### Verification Status Badges

Each party displays a status badge that updates based on their verification progress:

- **Loading** — blue background, spinner, "Initializing..."
- **Approved** — green background, "Verified"
- **Denied** — red background, "Denied"
- **Under Review** — yellow background, "Under Review"
- **Error** — red background, error message
- **Idle** — gray background, status message (e.g., "Closed by user," "Dismissed")

Verification option buttons are disabled once verification is loading, approved, or denied for that party.

### Verification Link Behavior

Verification links route to the identity verification provider (e.g., Alloy SDK for document verification), associated with the individual's screening step-up for that specific party. The SDK is initialized with the party's biographical data (name, email, date of birth) collected in Screen 9, **plus the address and SSN the party supplies themselves on the standalone landing page (Screen 9b)**. The SDK is never instantiated until those two screens are complete.

Verification option buttons are grayed out / unclickable until the screening orchestrator (e.g., Alloy) responds with the verification link for that party.

Standalone verification links are token-authenticated experiences served by Interro — they work without a host application account. The standalone experience carries host branding so it does not feel disconnected from the host platform.

### Checking Info

A "Checking info" section at the bottom displays verification status of the submitted entity data with loading spinners:

- Entity details
- Supplementary documents
- Entity documents

### Webhook Notifications

As each associated party completes or stalls their identity verification, Interro sends webhook notifications to the host application. The host can query aggregate status (N of M persons verified) via the retrieval API at any time.

### Reminder / Re-send

If a party has not completed verification, the primary user can re-send the verification link via email (and ideally SMS). The host application can also trigger reminders programmatically via API.

- **"Continue"** button to advance to the final status screen.

---

## Entity Flow — Screen 11: Final Verification Status

The page polls for completion status of all associated party verifications automatically.

### Pending State (Default)

- Loading spinner (large)
- "Verification Submitted" heading
- "We are reviewing your submission. This page will automatically update once all verifications are complete."

### Success State (Submitted)

Once all associated parties (UBOs, Control Persons) have successfully completed identity verification, the page automatically updates to display:

- Success visual — green checkmark icon
- "Verification Submitted" heading
- "Your information has been submitted for review. You may now close this window."

### Failure State (Submission Failed)

If the submission itself errors out, the page displays:

- Failure visual — red X icon
- "Submission Failed" heading
- "We were unable to submit your information. Please try again or contact support for assistance."
- **"Try again"** button that retriggers the submission
- Does not specify which party failed or the reason for failure

The page always lands on the submitted state unless the submission itself errors out. There are only two terminal states: submitted successfully, or submission failed. While verifications are still in progress, the page remains in the Pending state.

---

## Cross-Cutting Requirements

> *These requirements are shared across all verification flows (Individual, Joint, Entity).*

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
| `person:completed` | All steps for one person done (multi-person flows) | Person index, role | Update per-person progress |
| `flow:submitted` | User submitted within the component | Reference ID, person count | Trigger retention copy retrieval, update verification lifecycle |
| `flow:resumed` | Component loaded with existing partial data | Resumed step, overall progress | Sync host UI state |
| `document:uploaded` | A document was uploaded | Document type, reference | Track for progress |
| `error` | Validation failure, save failure, etc. | Error type, message | Display error or retry |

### Retrieval API

Interro exposes endpoints for the host to retrieve full datasets at any time:

| Data | Endpoint | Format |
|---|---|---|
| Applicant/person data (name, DOB, address, identity) | `GET /sessions/{id}/applicants` | Structured JSON |
| Document images (formation docs, supplementary docs) | `GET /sessions/{id}/documents/{docId}` | Binary (image/PDF) |
| Document metadata (type, upload date, file info) | `GET /sessions/{id}/documents` | Structured JSON |
| Screening results (per person) | `GET /sessions/{id}/screening` | Structured JSON |
| Session progress (step completion, status) | `GET /sessions/{id}/status` | Structured JSON |

### Security & Compliance

- **PII in transit:** TLS required for all communication between component, Interro backend, and host backend.
- **PII at rest:** SSNs, passport numbers, and identity documents encrypted at rest in Interro's storage. Host encrypts its retention copies using its own encryption pipeline.
- **Document uploads:** Handled directly by the component to Interro infrastructure — never routed through the host frontend.
- **AML/OFAC screening:** Each person independently screened. Results delivered per-person via webhook.
- **Data retention:** Host requires retrieval access for a minimum of 10 years. If Interro purges data on a shorter cycle, the host must be notified in advance.
- **Webhook security:** HMAC signature verification, retry with backoff on delivery failure, idempotency keys.
