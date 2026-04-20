# Joint Account Verification Flow — Screen-by-Screen Requirements

**Version:** 2.0
**Date:** March 2026
**Author:** Marco — Product, iAltA Payments
**First client:** Verivend

---

## Purpose

This document captures the screen-by-screen requirements for the joint account verification flow within the embeddable KYC UI that Interro offers to application clients. It reflects the current prototype implementation as iterated with Verivend and supersedes the v1 joint account flow requirements. It is structured to mirror the individual and entity verification flow requirements documents and shares several screens with the individual flow.

The joint account flow verifies 2–5 co-equal natural persons associated with a single account. It uses a two-phase model: the primary user (the Verivend account holder initiating the verification) completes their own full identity verification first, then enters biographical data for each additional co-holder. Each additional co-holder independently completes their own identity verification via a standalone, token-authenticated link served by Interro outside the host application.

The Context ID (KYC Basic or KYC Complete) selected for the session applies uniformly to all holders — the primary user and every additional co-holder go through the same verification variant.

**Key characteristics of the joint account flow:**

- 2–5 co-equal natural persons verified per session (1 primary user + up to 4 co-holders).
- The primary user completes their own verification in full within the embedded component before entering data for additional co-holders.
- Additional co-holders are not assumed to be users of the host application. Their identity verification occurs via standalone links outside the host app.
- KYC Basic or KYC Complete applies to all holders uniformly — if the session is KYC Complete, every holder (including those verifying via standalone link) goes through the Alloy SDK.
- Supplementary document collection (proof of address) is a standard step for the primary user. Only the primary user uploads supplementary documents within the embedded component.
- Host-controlled path selection: Verivend passes `path_type = joint` and `number_of_holders` (2–5) at session initialization, bypassing the component's type selection and sub-selection screens.
- The joint account type (JTWROS / TIC) is passed as a session initialization parameter by the host application — it is not selected within the UI.
- The co-holder count is flexible: the primary user can add 1–4 co-holders. On submit, the `numberOfHolders` is updated to match the actual count (primary + co-holders entered).

---

## Initialization & Configuration

Before the joint account flow begins, the host application creates a verification session via Interro's backend API. The initialization contract extends the individual flow's parameters with joint-specific fields.

### Session Initialization Parameters

| Parameter | Type | When Passed | Notes |
|---|---|---|---|
| Path type | `joint` | Always | Determines which flow the component loads. When supplied, the component skips its type selection screen and sub-selection screen, entering the joint flow directly. |
| Joint account type | `JTWROS` / `TIC` | Always (joint only) | Specifies the legal structure of the joint account. Passed by the host — not selected within the UI. Stored with the session for downstream compliance and reporting. |
| Number of holders | Integer (2–5) | Always (joint only) | Total number of co-holders including the primary user. Defaults to 3 if not specified. The component allows the primary user to add 1–4 co-holders; on submit, the actual count is reconciled. |
| Organization ID | String | Always | Links the session to the host application's org record. |
| Authenticated user context | Token / session ref | Always | Component receives auth context from the host; it does not manage login. |
| Pre-fill data | JSON object (optional) | When available | Any person data the host already holds for the primary user (e.g., name, DOB, address, country) can be passed to pre-populate fields. |
| Context ID | String | Optional | Selects the IDV flow variant applied to all holders. Defaults to `kyc_complete` (Alloy SDK for document capture + selfie). `kyc_basic` collects documents within the embeddable UI without the Alloy SDK. |

### Theming

Identical to the individual and entity flow theming specifications. See the entity flow requirements document for the full theming table.

The component renders inline within the host application — embedded in an iframe at `{client}.interro.co`, not redirected to a third-party domain.

---

## Joint Account Flow — Screen 1: Welcome / Type Selection

> *Shared with Individual and Entity flows.*

Display introductory header text explaining the purpose of KYC verification. A shield icon is displayed above the heading. Below the heading, explanatory text reads: "We need to verify your information before you can proceed. Please select your verification type below."

Two selection buttons are presented with identical styling:

- **Individual** — routes to the individual sub-selection screen.
- **Corporate / Entity** — routes to the entity flow.

### Sub-Selection: Solo vs Joint

After the user selects "Individual," a second selection is presented with a back arrow to return to the primary selection. A person icon is displayed above the heading "Individual Verification" with subtitle: "Select the type of individual verification you need."

- **Solo** — routes to the individual flow.
- **Joint Account** — routes to the joint account flow (this document).

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

**Conditional skip:** If the host application passes `path_type = joint` at session initialization, the type selection screen and sub-selection are both bypassed entirely. The user enters the joint flow directly at Screen 2. The user must still agree to the terms and conditions; the consent is surfaced on Screen 4 instead.

---

## Joint Account Flow — Screen 2: KYC Loading & Sensitive Data Disclaimer

> *Shared with Individual and Entity flows. Identical behavior — see entity flow requirements.*

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

## Joint Account Flow — Screen 3: Step Overview

Display a step-by-step summary of the full joint account verification flow before the user begins. The heading reads "Joint Account Verification" with subtitle: "Complete the following steps to verify your identity. Steps 1–4 verify your own identity. In Step 5, you'll provide information for the other account holders."

**KYC Complete (default):**

- **Step 1:** Provide your identity information — Name, date of birth, and tax identifier
- **Step 2:** Provide your address information — Current residential address
- **Step 3:** Provide supplementary documents — Proof of address
- **Step 4:** Identity verification — Photo ID and selfie via secure verification
- **Step 5:** Provide co-holder information — Enter details for each additional joint account holder

**KYC Basic:**

- **Step 1:** Provide your identity information — Name, date of birth, and tax identifier
- **Step 2:** Provide your address information — Current residential address
- **Step 3:** Provide supplementary documents — Proof of address
- **Step 4:** Upload identity documents — Photo ID verification
- **Step 5:** Provide co-holder information — Enter details for each additional joint account holder

Each step has an icon and label with a brief description. Steps 1–4 are displayed with a blue icon background; Step 5 is displayed with a yellow/amber icon background to visually distinguish the co-holder phase from the primary user's own verification.

The step overview dynamically adjusts Step 4's label and description based on the Context ID.

- Back button to return to previous screen.
- Language selector available.
- **"Start verification"** button to begin the flow.

---

## Joint Account Flow — Screen 4: Privacy & Consent Modal

> *Shared with Individual and Entity flows. Identical behavior — see entity flow requirements.*

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

## Joint Account Flow — Screen 5: Identity Information (Step 1)

> *Identical to individual flow Screen 5. The primary user provides their own identity information.*

Progress bar indicating current step: segment 1 of 5 is active.

Back button to return to previous screen. Language selector available.

### Heading

"Identity information" with subtitle: "Please provide your personal details."

### Collect the following fields

- **First name** (text input, required) — placeholder: "Enter first name."
- **Last name** (text input, required) — placeholder: "Enter last name."
- **Email** (email input, required) — placeholder: "email@example.com."
- **Phone number** (tel input, required) — placeholder: "5551234567." Numeric only, maximum 15 digits. Non-numeric characters are stripped on input.
- **Date of birth** (text input, mm/dd/yyyy format, required) — placeholder: "MM/DD/YYYY." Auto-formats as the user types: inserts slashes after month and day digits automatically. Maximum 10 characters.
- **SSN / Tax identifier** (masked input, required) — placeholder: "Enter SSN or tax identifier." Input is masked by default using a masked input component.

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

## Joint Account Flow — Screen 6: Address Information (Step 2)

> *Identical to individual flow Screen 6. The primary user provides their own address.*

Progress bar advances to Step 2 (segments 1–2 of 5 active).

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

## Joint Account Flow — Screen 7: Supplementary Documents (Step 3)

> *Identical to individual flow Screen 7. Only the primary user uploads supplementary documents — additional co-holders do not.*

Progress bar advances to Step 3 (segments 1–3 of 5 active).

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

## Joint Account Flow — Screen 8a: Identity Document — Country & Type Selection (KYC Basic Only — Step 4)

> *Only displayed for KYC Basic flows. Identical to individual flow Screen 8a.*

Progress bar advances to Step 4 (segments 1–4 of 5 active).

Back button to return to previous screen. Language selector available.

### Heading

"Identity document" with subtitle: "Select the issuing country and document type."

### Collect the following fields

- **Issuing country** (dropdown, required) — opens as a modal/overlay with search bar, scrollable list of countries with flag icons, real-time filtering, close (X) button.

- **Document type** (radio selection, required) — displayed dynamically after a country is selected. Available document types vary by country. See the individual flow requirements document for the full country-to-document-type mapping table.

Changing the issuing country resets the document type selection and clears any previously uploaded document images.

### Constraint to proceed

Both issuing country and document type must be selected.

- **"Continue"** button to proceed. Displays a loading animation while processing.

---

## Joint Account Flow — Screen 8b: Identity Document — Upload (KYC Basic Only — Step 4 continued)

> *Only displayed for KYC Basic flows after country and document type are selected. Identical to individual flow Screen 8b.*

Progress bar remains on Step 4 (segments 1–4 of 5 active).

Back button returns to the country & type selection screen (Screen 8a). Language selector available.

### Header

Displays the selected country flag and document type name with an edit (pencil) icon to return to the country & type selection screen.

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

Each side has its own labeled upload zone. See the individual flow requirements document for full upload zone specifications.

### Constraint to proceed

All required sides for the selected document type must be uploaded.

- **"Upload document"** button to proceed. Displays a loading animation while processing.

---

## Joint Account Flow — Screen 8c: Identity Verification — Alloy SDK (KYC Complete Only — Step 4)

> *Only displayed for KYC Complete flows. Identical to individual flow Screen 8c. The primary user completes identity verification via the Alloy SDK.*

Progress bar advances to Step 4 (segments 1–4 of 5 active).

Back button to return to previous screen. Language selector available.

### Pre-SDK Explanation Screen

Before launching the SDK, a pre-verification screen is displayed with:

- ID card icon in a blue circle
- Heading: "Identity Verification"
- Instructional text: "Complete your identity verification by following these two steps:"

Two numbered steps displayed in styled cards:

1. **Snap a photo of your ID** — "or upload a document image"
2. **Take a selfie** — "to verify your identity"

### SDK Launch and Result Handling

Identical to individual flow Screen 8c. See the individual flow requirements document for:

- SDK initialization parameters (API key, journey token, evaluation data, journey application creation)
- Result handling (approved, denied, review, closed, error states)
- All five screen states (idle, loading, success, review, error)

On success, the user auto-advances to the co-holder entry screen (Screen 9).

---

## Joint Account Flow — Screen 9: Co-Holder Information Entry (Step 5)

> *This screen is unique to the joint account flow. It implements Phase 1 of the two-phase model.*

Progress bar advances to Step 5 (all 5 segments active).

Back button to return to previous screen. Language selector available.

### Heading

"Add your joint account holders" with subtitle: "Please provide the following information for each additional account holder. Each person will receive a link to independently verify their identity. You can add up to 4 co-holders."

### Count Indicator

A styled count badge displays progress:

- When no co-holders have been added: blue background, "0 co-holders added"
- When at least one co-holder has been added: green background with checkmark, e.g., "2 co-holders added"

### Co-Holder List (Populated State)

Each added co-holder displays as a card showing:

- Person icon
- Full name (first, last)
- Email address
- Edit (pencil) icon to modify
- Delete (trash) icon to remove

Additional co-holders can be added via **"+ Add co-holder"** link below the list. This link is hidden once the maximum of 4 co-holders has been reached.

### Constraint to proceed

At least one co-holder must be added before submitting. If no co-holder has been added, the Submit button is disabled and a validation error is displayed: "Please add at least one joint account holder before submitting."

### On Submit

- **"Submit"** button triggers a loading animation (rotating dot ellipsis) while processing.
- On submit, the component updates the `numberOfHolders` to match the actual count (primary user + co-holders entered).
- When the user submits, the component emits a `flow:submitted` event to the host application. This triggers the host's retention copy retrieval and verification lifecycle management. The user advances to Screen 10.

### Persistence

Each added co-holder is durably saved server-side as they are created. If the primary user navigates away and returns, all previously added co-holders are displayed in the list. Partially completed co-holder forms are not saved — only submitted entries persist.

---

## Joint Account Flow — Screen 9a: Add Co-Holder Form

Progress bar shows all 5 segments active (Step 5 context).

Back button returns to the Co-Holder Entry screen (Screen 9). Language selector available.

### Heading

"Add co-holder" (or "Edit co-holder" when editing an existing entry) with subtitle: "Provide contact and address information. They will receive a link to verify their identity independently." (When editing: "Update the details for this co-holder.")

### Collect the following fields — Identity Information

- **First name** (text input, required) — placeholder: "First name."
- **Last name** (text input, required) — placeholder: "Last name."
- **Date of birth** (text input, mm/dd/yyyy format, required) — placeholder: "MM/DD/YYYY." Auto-formats as the user types. Maximum 10 characters. Validation error: "The date must be valid (mm/dd/yyyy)" for invalid dates.
- **Email** (email input, required) — placeholder: "email@example.com." Used to deliver the standalone verification link.
- **Phone number** (tel input, required) — placeholder: "5551234567." Numeric only, maximum 15 digits. Non-numeric characters are stripped on input.

### Collect the following fields — Address

Displayed under an "Address" subheading within the same form.

- **Country** (dropdown, required) — opens as a modal/overlay with search bar, scrollable list of countries with flag icons, real-time filtering, close (X) button.
- **State / Province** (dropdown, conditionally required) — displayed dynamically when US or Canada is selected as the country. Label adjusts: "State" for US, "Province" for Canada. Opens as a modal/overlay with search bar. Hidden for other countries.
- **Street address** (text input, required) — placeholder: "Enter street address."
- **Apartment / Suite / Unit** (text input, optional) — placeholder: "Apt, suite, unit (optional)."
- **City / Town** (text input, required) — placeholder: "Enter city or town."
- **Postal / ZIP code** (text input, required) — placeholder: "Enter postal code." Format validation for US: must match `#####` or `#####-####` pattern. Error: "Enter a valid US ZIP code."

### Field-Level Validation

Required fields show red border and "This field is required" error text when left empty on submit. Date field shows format-specific error. Postal code validates format based on country.

### Constraint to proceed

All required fields (first name, last name, date of birth, email, phone, country, state/province if applicable, street address, city, postal code) must pass validation.

- **"Add co-holder"** button (or **"Update co-holder"** when editing) to save the person and return to the co-holder list. Displays a loading animation while processing.

After saving, the user is returned to the Co-Holder Entry screen (Screen 9) with the newly added/updated co-holder visible in the list.

### Note on Co-Holders

The co-holders added here are not assumed to be users of the host application. Their identity verification will happen outside the host app via standalone, token-authenticated links (see Screen 10). The email address collected here is used to deliver those verification links.

---

## Joint Account Flow — Screen 10: Co-Holder Verification & Submission Confirmation

> *This screen is structurally similar to the entity flow's Associated Party Verification screen (Entity Flow Screen 10).*

Progress bar shows all 5 segments active.

### Heading

"One last step" with subtitle: "All joint account holders must verify their identity to complete account verification."

### Verification Actions

**"Remind all pending holders"** button to bulk-notify all co-holders who have not yet completed verification.

Collapsible **"Verification required"** section showing count of pending verifications in a count badge. The pending count dynamically updates as co-holders complete or are denied verification. The section is expanded by default and can be toggled via a chevron icon.

Each co-holder listed with:

- Person icon
- Full name
- Email address
- Three verification options:
    - **"Verify now"** — opens the identity verification flow inline via the Alloy SDK. Available if the co-holder is physically present with the primary user.
    - **"Send to email"** — sends the verification link to the co-holder's email address.
    - **"Copy link"** — copies the verification link to clipboard. Displays "Copied!" confirmation for 2 seconds.

The three options are presented uniformly across both variants, but their relative utility differs — see *Verification Link Behavior* below for UX expectations per variant.

### Verification Status Badges

Each co-holder displays a status badge that updates based on their verification progress:

- **Loading** — blue background, spinner, "Initializing..."
- **Approved** — green background, "Verified"
- **Denied** — red background, "Denied"
- **Under Review** — yellow background, "Under Review"
- **Error** — red background, error message
- **Idle** — gray background, status message (e.g., "Closed by user," "Dismissed")

Verification option buttons are disabled once verification is loading, approved, or denied for that co-holder.

### Verification Link Behavior

Verification links route to the identity verification experience determined by the session's Context ID:

- **KYC Complete:** the standalone link initiates the Alloy SDK for document capture and selfie/liveness.
- **KYC Basic:** the standalone link opens the embeddable UI's document upload flow (country/type selection, then upload).

#### UX Expectations by Variant

The three verification options (*Verify now*, *Send to email*, *Copy link*) are offered uniformly across both variants, but the intended primary path differs:

- **KYC Complete:** *Verify now* is a meaningful primary path when the co-holder is physically present, because the Alloy SDK requires live selfie/liveness capture that benefits from synchronous handoff of the device. *Send to email* / *Copy link* cover the asynchronous case.
- **KYC Basic:** *Send to email* (and *Copy link*) are the expected primary paths. Document upload is inherently asynchronous — the co-holder needs their physical ID on hand and will typically prefer to complete the step on their own device. *Verify now* remains available for edge cases (e.g., a co-holder who explicitly asks to use the primary user's device), but should not be presented as the default action. Hosts and the embeddable UI may choose to visually deprioritize *Verify now* in KYC Basic (e.g., as a secondary link rather than an equal-weight button) to steer users toward the email-delivered path.

The SDK is initialized with the co-holder's biographical data (name, email, date of birth, address) collected in Screen 9a. A journey application is created via the Alloy API with the co-holder's data; if the API call fails, the SDK falls back to SDK-only flow.

Verification option buttons are grayed out / unclickable until the screening orchestrator (e.g., Alloy) responds with the verification link for that co-holder.

Standalone verification links are token-authenticated experiences served by Interro — they work without a host application account. The standalone experience carries host branding so it does not feel disconnected from the host platform.

### Checking Info

A "Checking info" section at the bottom displays verification status of the primary user's submitted data with loading spinners:

**KYC Complete:**

- Identity information
- Address information
- Supplementary documents
- Identity verification

**KYC Basic:**

- Identity information
- Address information
- Supplementary documents
- Identity documents

### Webhook Notifications

As each co-holder completes or stalls their identity verification, Interro sends webhook notifications to the host application. The host can query aggregate status (N of M holders verified) via the retrieval API at any time.

### Reminder / Re-send

If a co-holder has not completed verification, the primary user can re-send the verification link via email (and ideally SMS). The host application can also trigger reminders programmatically via API.

- **"Continue"** button to advance to the final status screen.

---

## Joint Account Flow — Screen 11: Final Verification Status

### Checking Phase (Default)

Displays a loading spinner at the top with heading "Verification Submitted" and subtitle "Please wait while we confirm your submission..."

Below, a checklist of verification items is displayed, each with either a loading spinner (pending) or a green checkmark (verified). Items are verified sequentially with a 1.2-second interval between each:

**KYC Complete:**

1. Identity information (primary user)
2. Address information (primary user)
3. Supplementary documents (primary user)
4. Identity verification (primary user)
5. {Co-holder first name} {Co-holder last name} — verification (one entry per co-holder)

**KYC Basic:**

1. Identity information (primary user)
2. Address information (primary user)
3. Supplementary documents (primary user)
4. Identity documents (primary user)
5. {Co-holder first name} {Co-holder last name} — verification (one entry per co-holder)

The checklist dynamically includes one entry per co-holder added in Step 5, labeled with their full name.

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
- Does not specify which co-holder failed or the reason for failure

While verifications are still in progress, the page remains in the Checking phase.

---

## Flow Order Summary

### KYC Complete

Screen 1 (Welcome) -> Screen 2 (Disclaimer) -> Screen 3 (Step Overview) -> Screen 4 (Consent) -> Screen 5 (Identity Info) -> Screen 6 (Address) -> Screen 7 (Supplementary Docs) -> Screen 8c (Alloy SDK Verification) -> Screen 9 (Co-Holder Entry) -> Screen 10 (Co-Holder Verification) -> Screen 11 (Status)

### KYC Basic

Screen 1 (Welcome) -> Screen 2 (Disclaimer) -> Screen 3 (Step Overview) -> Screen 4 (Consent) -> Screen 5 (Identity Info) -> Screen 6 (Address) -> Screen 7 (Supplementary Docs) -> Screen 8a (ID Country & Type) -> Screen 8b (ID Upload) -> Screen 9 (Co-Holder Entry) -> Screen 10 (Co-Holder Verification) -> Screen 11 (Status)

---

## Cross-Cutting Requirements

> *These requirements are shared across all verification flows. See the entity flow requirements document for the full specification. Items specific to the joint account flow are called out below.*

### Session Durability

- **Server-side persistence on step completion** — not browser session storage, not localStorage. When a user completes a step, that step's data is durably saved.
- **Cross-device resume** — start on desktop, finish on mobile. Component keyed by external user ID; new token for same user resumes at first incomplete step.
- **No data loss on logout / navigation away** — all previously completed steps survive a full logout/login cycle.
- **Long-lived sessions** — sessions remain resumable for 30 days.

### Progress Visibility Outside the Component

The host application can determine verification progress without loading the embedded component, via:

- **Webhooks** pushed from Interro on step completion (`session.step_completed`, `session.submitted`, `session.screening_completed`, `session.last_activity`)
- **Polling API** — `GET /sessions/{id}/status` returns current progress state, including aggregate co-holder verification status (N of M verified)

This enables the host to show progress indicators, trigger email campaigns, surface abandoned verifications in admin dashboards, and track time-to-completion and drop-off metrics.

### Returned-for-Corrections Flow

When a host admin or automated screening returns a submission:

- The component supports re-entry in correction mode — loads previously submitted data, flags items that need attention, allows editing.
- Correction guidance is at minimum per-step, ideally per-field with human-readable reasons.
- For joint accounts, corrections may apply to the primary user's data, a specific co-holder's biographical data, or both. The correction mode should clearly indicate which person's data needs attention.
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
| `person:completed` | All steps for one person done | Person index, role (primary / co-holder) | Update per-person progress |
| `flow:submitted` | User submitted within the component | Reference ID, person count | Trigger retention copy retrieval, update verification lifecycle |
| `flow:resumed` | Component loaded with existing partial data | Resumed step, overall progress | Sync host UI state |
| `document:uploaded` | A document was uploaded | Document type, reference, person index | Track for progress |
| `sdk:initialized` | Alloy SDK loaded (KYC Complete only) | SDK session ref | Track SDK handoff |
| `sdk:completed` | Alloy SDK returned results (KYC Complete only) | Status, reference | Track SDK completion |
| `coholder:added` | Primary user added a co-holder | Person index, name, email | Track co-holder entry |
| `coholder:verification_sent` | Verification link sent to co-holder | Person index, delivery method | Track outreach |
| `coholder:verification_completed` | Co-holder completed standalone verification | Person index, status | Update aggregate progress |
| `error` | Validation failure, save failure, SDK error, etc. | Error type, message | Display error or retry |

### Retrieval API

Interro exposes endpoints for the host to retrieve full datasets at any time:

| Data | Endpoint | Format |
|---|---|---|
| All applicant data (primary + co-holders) | `GET /sessions/{id}/applicants` | Structured JSON (array of persons with role indicators) |
| Document images (per person) | `GET /sessions/{id}/documents/{docId}` | Binary (image/PDF) |
| Document metadata (type, upload date, person ID) | `GET /sessions/{id}/documents` | Structured JSON |
| Screening results (per person) | `GET /sessions/{id}/screening` | Structured JSON |
| Session progress (step completion, co-holder status) | `GET /sessions/{id}/status` | Structured JSON |

Document metadata returned by `GET /sessions/{id}/documents` must include a person identifier for each document record, attributing every collected document to the specific individual who provided it within the session.

### Security & Compliance

- **PII in transit:** TLS required for all communication between component, Interro backend, and host backend.
- **PII at rest:** SSNs, tax identifiers, passport numbers, and identity documents encrypted at rest in Interro's storage. Host encrypts its retention copies using its own encryption pipeline.
- **SSN / Tax identifier handling:** Masked in the UI by default. Never logged in plaintext. Encrypted before persistence. Displayed in masked state on session resume.
- **Document uploads:** Handled directly by the component to Interro infrastructure — never routed through the host frontend.
- **AML/OFAC screening:** Each person (primary user and all co-holders) is independently screened against AML/OFAC watchlists. Results delivered per-person via webhook.
- **Standalone verification links:** Token-authenticated. Carry host branding. Tokens expire per the standalone link expiry policy. Links are single-session — opening on a new device invalidates the prior token.
- **Data retention:** Host requires retrieval access for a minimum of 10 years. If Interro purges data on a shorter cycle, the host must be notified in advance.
- **Webhook security:** HMAC signature verification, retry with backoff on delivery failure, idempotency keys.
