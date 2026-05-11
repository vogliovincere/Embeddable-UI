# Joint Account Flow — KYC Basic — ID Upload Sequencing

**Audience:** Alloy journey configuration team
**Purpose:** Show where and when identity documents are collected for the **primary user** and each **additional co-holder** in a KYC Basic joint account session, so the Alloy journey can be configured to accept ID uploads at the correct step per person.

---

## Key points for Alloy journey configuration

1. The session is **KYC Basic** — document capture happens in the embeddable UI, **not** via the Alloy SDK. Alloy's role here is screening/evaluation on the submitted document + biographical data, not live capture.
2. **Primary user** uploads their ID **inside the embedded component** (Step 4, before co-holder entry).
3. **Each additional co-holder** uploads their ID **outside** the primary user's embedded session, via a **standalone token-authenticated link** served at `{client}.interro.co`. The standalone page opens the same document upload flow (country/type → upload).
4. Per-person ID uploads arrive at Alloy asynchronously and at different times:
   - Primary user's ID → submitted when the primary reaches the end of Step 4.
   - Co-holder IDs → submitted independently, whenever each co-holder opens their link and completes the upload. May be minutes, hours, or days apart.
5. Alloy should treat **each holder as an independent applicant** (journey application per person), keyed by person index within the session. Aggregate "N of M verified" status is rolled up by Interro, not Alloy.

---

## Flow diagram

```mermaid
flowchart TD
    Start([Session init: path_type=joint, context_id=kyc_basic, number_of_holders=2-5])

    subgraph PRIMARY["PRIMARY USER — inside embedded component"]
        direction TB
        S5["Screen 5<br/>Step 1: Identity info<br/>(name, DOB, SSN)"]
        S6["Screen 6<br/>Step 2: Address"]
        S7["Screen 7<br/>Step 3: Proof of address upload"]
        S8a["Screen 8a<br/>Step 4: Issuing country + document type"]
        S8b["Screen 8b — PRIMARY ID UPLOAD<br/>Step 4 cont'd: upload ID image(s)<br/>Passport=1 side, ID/DL/Permit=2 sides"]
        S9["Screen 9 / 9a<br/>Step 5: Enter biographical data<br/>for 1–4 co-holders<br/>(NO ID upload here)"]
        S10["Screen 10<br/>Distribute co-holder verification links"]

        S5 --> S6 --> S7 --> S8a --> S8b --> S9 --> S10
    end

    Start --> S5

    S8b -. "Primary ID + bio submitted to Alloy<br/>as journey application #1" .-> AlloyP[(Alloy<br/>primary applicant)]

    S10 -->|"Send to email (primary path for KYC Basic)"| EMAIL[Email delivered to co-holder]
    S10 -->|"Copy link"| CLIP[Primary shares link manually]
    S10 -.->|"Verify now — edge case only<br/>(co-holder physically present)"| INLINE[Inline handoff on primary's device]

    EMAIL --> CHLINK
    CLIP --> CHLINK
    INLINE --> CHLINK

    subgraph CO["EACH CO-HOLDER — standalone token-authenticated link<br/>(repeats independently for each co-holder, 1 to 4 times)"]
        direction TB
        CHLINK["Standalone page at {client}.interro.co<br/>(token-authenticated, host-branded)"]
        CH8a["Co-holder Screen 8a<br/>Issuing country + document type"]
        CH8b["Co-holder Screen 8b — CO-HOLDER ID UPLOAD<br/>Upload ID image(s)"]
        CHDone["Co-holder submission<br/>→ webhook to host + Interro"]

        CHLINK --> CH8a --> CH8b --> CHDone
    end

    CH8b -. "Co-holder ID + bio submitted to Alloy<br/>as journey application per person" .-> AlloyC[(Alloy<br/>co-holder applicants<br/>1 per co-holder)]

    CHDone --> S11

    S10 --> S11["Screen 11<br/>Final status<br/>(waits for all holders to complete)"]

    classDef primaryBox fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef coholderBox fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef upload fill:#dcfce7,stroke:#16a34a,color:#14532d,font-weight:bold
    classDef alloy fill:#ede9fe,stroke:#7c3aed,color:#4c1d95

    class S5,S6,S7,S8a,S9,S10 primaryBox
    class CHLINK,CH8a,CHDone coholderBox
    class S8b,CH8b upload
    class AlloyP,AlloyC alloy
```

---

## When each person's ID reaches Alloy

| Person | Screen | Where it runs | When it submits | Alloy journey application |
|---|---|---|---|---|
| Primary user | 8a → 8b | Embedded component in host app | End of primary's Step 4 (before co-holder entry) | App #1, created at primary Step 4 submit |
| Co-holder 1 | 8a → 8b (standalone) | `{client}.interro.co` standalone page | When co-holder opens their link and finishes upload | App #2, created when co-holder submits |
| Co-holder 2..N | 8a → 8b (standalone) | `{client}.interro.co` standalone page | Independently, per co-holder | One app per co-holder |

---

## Configuration implications for the Alloy journey

- **One journey, multiple applications per session.** Each holder is a separate journey application tagged with a person index (primary vs co-holder 1..4) and the shared session ID.
- **Document-only entry points.** The Alloy SDK's live capture is **not** used in KYC Basic. The journey must accept pre-captured document images + biographical data and run screening/evaluation on them.
- **Asynchronous arrival.** Co-holder applications can be created hours or days after the primary user's. The journey must not require that all holders be submitted in the same transaction.
- **Per-person outcomes.** Each holder receives an independent approved / denied / review outcome. Interro rolls these up and only transitions the session to "submitted successfully" on Screen 11 after all holders terminate.
- **Returned-for-corrections.** If a specific holder is returned, only that holder's document/bio step re-opens — either in the primary's embedded session (primary) or via a fresh standalone link (co-holder). The journey application for that holder is updated in place.

---

## Out of scope for this diagram

- KYC Complete flow (uses Alloy SDK for live selfie/liveness per holder — documented separately).
- Proof-of-address upload for co-holders (co-holders do **not** upload supplementary documents; only the primary user does).
- Entity / Corporate flow.
