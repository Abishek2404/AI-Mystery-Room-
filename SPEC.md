# AI Mystery Room --- Project Specification

**Document:** `SPEC.md`\
**Version:** 1.0\
**Status:** Implementation blueprint\
**Product type:** AI-powered mystery investigation web application

------------------------------------------------------------------------

## 1. Project Overview

### 1.1 Summary

AI Mystery Room lets a player create and solve a fictional mystery
generated with Google's Gemini API. The player reviews the case story,
investigates suspects, discovers clues, requests hints, and submits an
accusation. The server evaluates the accusation and returns the verdict,
solution explanation, and score.

The core experience should feel like a compact detective game: clear
objectives, evidence-led reasoning, visible progress, and a satisfying
reveal at the end.

### 1.2 Problem Statement

Mystery games can be difficult to personalize and replay. This project
uses generative AI to create varied cases from a player's premise and
selected difficulty, while application rules enforce a consistent case
structure, fair scoring, and protection against revealing the answer too
early.

### 1.3 Goals

-   Generate playable mysteries for Easy, Medium, and Hard difficulties.
-   Give players a clear investigation flow from case creation to
    verdict.
-   Ensure clues support one defensible culprit and do not contradict
    the solution.
-   Keep the answer and solution rationale on the server until the
    accusation is submitted.
-   Calculate scores and validate game actions on the backend.
-   Deploy a complete, responsive application that can be demonstrated
    end to end.

### 1.4 Non-goals for the initial release

-   Multiplayer or live co-op investigations.
-   User-generated public case sharing or a public case marketplace.
-   Real-world crime advice, real-person accusations, or use of private
    personal data.
-   Payments, subscriptions, leaderboards, or social features.
-   Training or fine-tuning a model.
-   Guaranteeing that every AI-generated mystery is literary-quality;
    the server must validate structure and consistency, and invalid
    generations must be retried or rejected.

### 1.5 Target Users

-   Students learning full-stack web development and AI integration.
-   Casual players who enjoy detective stories, puzzles, and deduction.
-   Demo reviewers evaluating an AI-powered full-stack application.

### 1.6 Success Measures

-   A player can complete a mystery without manual intervention.
-   All three difficulty levels use the specified suspect, clue, and
    hint counts.
-   No API response before accusation includes the culprit ID, answer,
    or solution explanation.
-   Server-side score calculations match the documented rules.
-   A deployed build supports the full happy path and communicates
    errors clearly.

------------------------------------------------------------------------

## 2. Scope and Feature Priorities

### 2.1 MVP features

1.  Home page with product explanation and start action.
2.  Mystery creation form with premise and difficulty.
3.  Gemini-powered case generation with strict schema validation.
4.  Investigation room with story, suspect list, clue discovery, hint
    requests, and progress.
5.  Accusation flow that allows one final accusation per case.
6.  Results page with verdict, culprit, explanation, and score.
7.  Persistent case and player-progress data in MongoDB.
8.  Loading, empty, validation, rate-limit, and server-error states.
9.  Responsive layouts and accessible form controls.
10. Server-side input validation, safe error handling, and secret
    management.

### 2.2 Optional enhancements (after MVP)

-   Case history and replay.
-   Authentication and saved player profiles.
-   Daily mystery challenge.
-   Sound effects, animation, and theme options.
-   Leaderboard, only after abuse-resistant score validation is in
    place.
-   Automated tests for generation quality and gameplay invariants.
-   Admin-only diagnostics for failed AI generations.

Optional enhancements must not delay a secure, working MVP.

------------------------------------------------------------------------

## 3. Technology Stack and Architecture

### 3.1 Required stack

-   **Frontend:** React, Vite, TypeScript recommended.
-   **Styling:** Tailwind CSS.
-   **Backend:** Node.js, Express.
-   **Database:** MongoDB with Mongoose.
-   **AI provider:** Gemini API through the official Google Gen AI SDK.
-   **Validation:** Zod or an equivalent schema validator on the server.
-   **Deployment:** Any compatible frontend host and Node.js backend
    host, plus a managed MongoDB deployment such as MongoDB Atlas.

Pin supported package versions and verify the selected Gemini model and
SDK against current provider documentation during implementation.

### 3.2 High-level architecture

``` text
Browser (React + Vite + Tailwind)
              |
              | HTTPS / JSON
              v
       Express REST API
       |       |       |
       |       |       +--> Server-side validation and scoring
       |       +----------> Gemini API (secret key only on server)
       +------------------> MongoDB via Mongoose
```

The browser must never call Gemini directly with a private API key. The
backend is the authority for case state, clue discovery, hints used,
accusation, and score.

### 3.3 Suggested repository structure

``` text
ai-mystery-room/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── styles/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── gemini.service.ts
│   │   │   ├── case-generator.service.ts
│   │   │   └── scoring.service.ts
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── app.ts
│   └── package.json
├── SPEC.md
├── .env.example
├── .gitignore
└── README.md
```

This is a recommended layout, not a requirement to use every file. Keep
controllers thin and put generation, validation, and scoring rules in
testable services.

------------------------------------------------------------------------

## 4. User Flow and Game State

### 4.1 Main user journey

1.  Player opens Home.
2.  Player selects **Create Mystery**.
3.  Player enters a fictional premise and selects Easy, Medium, or Hard.
4.  Frontend submits the request to `POST /api/cases`.
5.  Backend validates the request, asks Gemini for a structured mystery,
    validates the output, and saves a playable case.
6.  Player opens the Investigation Room and reads the case story.
7.  Player examines suspects and discovers available clues. Each clue
    can be discovered at most once.
8.  Player may request hints within the difficulty's hint limit.
9.  Player selects a suspect and confirms the accusation.
10. Backend locks the case, evaluates the accusation, calculates the
    score, and stores the result.
11. Results page displays the verdict, culprit, explanation, score
    breakdown, and option to start another case.

### 4.2 Case lifecycle

Use an explicit state field:

-   `active`: player may discover clues and request hints.
-   `completed`: accusation has been submitted and result stored.
-   `generation_failed`: generation did not produce a valid case; this
    state may be kept only for diagnostics and should not be presented
    as a playable case.

Only `active` cases may accept discovery, hint, or accusation actions. A
completed case cannot be modified or accused again.

### 4.3 Navigation

-   Home → Create Mystery.
-   Create Mystery → Investigation Room after successful generation.
-   Investigation Room → Accusation panel or modal.
-   Successful accusation → Results.
-   Results → Create Mystery / Home.

Refreshing an active case should restore progress from the server. A
frontend route or client-side state must not be treated as the source of
truth.

------------------------------------------------------------------------

## 5. Page and UI Specifications

### 5.1 Home

**Purpose:** Explain the game and let the player begin.

**Required elements** - Product name and concise tagline. - Short
explanation of the detective gameplay. - Primary **Start a Mystery**
button. - Three difficulty summaries. - Optional "How to Play" section.

**States** - Default landing state. - If case history is later added,
show recent cases only for authenticated or securely associated users.

### 5.2 Create Mystery

**Purpose:** Collect a premise and difficulty.

**Required elements** - Premise textarea with clear instructions to use
fictional characters and settings. - Character limit, recommended
20--500 characters. - Difficulty selector: Easy, Medium, Hard. -
"Generate Mystery" submit button. - Validation message and generation
progress state.

**Validation** - Trim whitespace. - Reject empty premises and premises
outside the configured character limit. - Do not accept difficulty
values outside the three allowed values. - Disable duplicate submissions
while a request is in progress. - Provide a retry option for transient
generation errors without silently creating multiple cases.

**Loading copy:** "Building your case and checking the evidence..."

### 5.3 Investigation Room

**Purpose:** Present the case without exposing the answer.

**Required elements** - Case title, difficulty, and story. - Progress
indicator: discovered clues / total clues. - Suspect cards showing
public details: name, description, motive, and alibi. - Clue list with
discover action and discovered state. - Hints panel with remaining hint
count. - Current score estimate or score breakdown, if shown, must not
reveal the culprit. - **Make an Accusation** action. - Confirmation
dialog before submitting an accusation.

**Rules** - Show only public suspect and clue data. - A clue's content
is returned only when the player discovers it. If clue discovery is
intended to be an action, do not send all undiscovered clue content to
the browser in the initial case response. - Do not expose solution
fields in HTML, JavaScript state, API payloads, logs sent to the client,
or hidden DOM attributes. - Prevent repeat clue rewards and duplicate
hint deductions. - After case completion, investigation actions are
disabled.

### 5.4 Accusation

**Purpose:** Make the player's final decision explicit.

**Required elements** - Select one suspect. - Display selected suspect
clearly. - Explain that submitting ends the investigation. - Confirm and
cancel actions.

**Validation** - Suspect ID must belong to the case. - Case must still
be active. - Only one accusation is accepted; repeated network requests
must not change the saved result.

### 5.5 Results

**Purpose:** Reveal and explain the outcome.

**Required elements** - Verdict: correct or incorrect. - Culprit's name
and public suspect details. - Solution explanation linking key evidence
to the culprit. - Score total and breakdown. - Correct-accusation base
points, clue points, hint penalties, and final score. - **Play Another
Mystery** action.

Results should be loaded from the server, not computed from
client-provided values.

### 5.6 Responsive and accessibility requirements

-   Mobile-first layout that works at 320px and above.
-   Suspect cards stack on narrow screens and use a grid on wider
    screens.
-   All controls are keyboard accessible and have visible focus styles.
-   Inputs have labels; icon-only controls have accessible names.
-   Color is not the only indicator of clue state or verdict.
-   Respect reduced-motion preferences.
-   Loading and error messages should be announced appropriately to
    assistive technology.

### 5.7 Global states

-   **Loading:** visible progress feedback; prevent duplicate actions.
-   **Validation error:** show field-specific messages.
-   **Generation error:** explain that a case could not be generated and
    allow retry.
-   **Network error:** preserve safe form inputs and allow retry.
-   **Not found:** show a useful missing-case page.
-   **Rate limited:** explain that the player should wait before trying
    again.
-   **Completed case:** display results and prevent further gameplay
    mutations.

------------------------------------------------------------------------

## 6. Mystery Content Model and Gemini Output

### 6.1 Difficulty configuration

  Difficulty     Suspects   Clues   Hints   Correct accusation base
  ------------ ---------- ------- ------- -------------------------
  Easy                  3       5       2                       100
  Medium                4       7       3                       150
  Hard                  5       9       3                       200

The server owns this configuration. Do not trust counts or point values
supplied by the client.

### 6.2 Generation prompt requirements

The backend generation prompt must instruct Gemini to:

-   Create a fictional, self-contained mystery based on the user's
    premise.
-   Use the exact suspect, clue, and hint counts for the requested
    difficulty.
-   Assign stable unique IDs to suspects, clues, and hints.
-   Select exactly one culprit from the suspects.
-   Provide a solution explanation grounded in the evidence.
-   Make clues logically consistent with the culprit and timeline.
-   Include evidence that distinguishes the culprit from plausible
    alternatives.
-   Avoid contradictions between story, alibis, clue content, and
    solution.
-   Make hints progressively more helpful without immediately naming the
    culprit.
-   Return structured JSON matching the server schema, with no markdown
    fences or extra prose.
-   Avoid real-person allegations, personal data, and instructions for
    real-world wrongdoing.

### 6.3 Recommended internal generation schema

The exact schema may be implemented with Zod and mapped to Mongoose.
Example internal JSON shape:

``` json
{
  "title": "The Clocktower Letter",
  "story": "A fictional case introduction...",
  "difficulty": "medium",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Mira Vale",
      "description": "The museum archivist...",
      "motive": "A public-facing motive...",
      "alibi": "A claim that can be tested against evidence..."
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "A Stopped Clock",
      "content": "Evidence text shown after discovery...",
      "location": "Clocktower landing",
      "relevance": "How the evidence can be interpreted"
    }
  ],
  "hints": [
    {
      "id": "hint_1",
      "content": "Compare the stated timeline with the clock evidence."
    }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "explanation": "A concise evidence-based explanation...",
    "keyClueIds": ["clue_1", "clue_2"]
  }
}
```

**Security note:** This is an internal server-side shape. Do not return
it wholesale from a public endpoint. The public DTO must omit
`solution`, `culpritId`, private validation notes, and any field that
directly reveals the answer. Never rely on frontend code to hide a
secret already sent to the browser.

### 6.4 Server validation after generation

Before saving a generated case, validate:

1.  JSON parses and matches the schema.
2.  Difficulty is one of the allowed values and matches the request.
3.  Suspect, clue, and hint counts exactly match the difficulty
    configuration.
4.  All IDs are unique within their entity type.
5.  `solution.culpritId` references an existing suspect.
6.  Every key clue ID references an existing clue.
7.  Required strings are non-empty and within length limits.
8.  The explanation and key clues are present.
9.  Hints do not directly reveal the culprit by name.
10. The story and evidence are plausibly consistent.

A schema check cannot prove logical consistency. Add a second AI
critique/repair pass or a deterministic validation pass for obvious
contradictions. If validation fails, retry generation a limited number
of times (for example, two attempts after the initial attempt). If still
invalid, return a controlled error and do not save a playable case.

### 6.5 Public response shaping

Use explicit response DTOs or serializer functions. Never serialize the
full Mongoose document directly.

-   Case creation returns story, suspects, difficulty, progress, and
    clue metadata, but not the culprit or solution.
-   Clue discovery returns only the requested clue content and updated
    progress.
-   Hint request returns only the next eligible hint and updated
    remaining hint count.
-   Result endpoint returns solution fields only after the case is
    completed.

------------------------------------------------------------------------

## 7. Scoring Rules

### 7.1 Formula

For a completed case:

`finalScore = max(0, basePoints + discoveredClueCount * 5 - hintsUsedCount * 10)`

Where: - `basePoints` is 100 for Easy, 150 for Medium, 200 for Hard when
the accusation is correct. - `basePoints` is 0 when the accusation is
incorrect. - `discoveredClueCount` is the number of unique clues
discovered before accusation. - `hintsUsedCount` is the number of hints
actually returned to the player. - Final score cannot be negative.

### 7.2 Examples

-   Easy, correct, 3 clues, 1 hint: `100 + 15 - 10 = 105`.
-   Medium, incorrect, 5 clues, 2 hints: `0 + 25 - 20 = 5`.
-   Hard, correct, 0 clues, 3 hints: `200 - 30 = 170`.

### 7.3 Enforcement

-   Calculate score on the backend from persisted case state.
-   Never accept `score`, `correct`, `culpritId`, `discoveredClueCount`,
    or `hintsUsedCount` as authoritative client inputs.
-   Store the score breakdown at completion for auditability.
-   A clue can award points only once.
-   A hint penalty applies only when a hint was successfully delivered.
-   Make accusation and score persistence atomic where practical, using
    a transaction or guarded conditional update.
-   Repeat requests must return the existing result rather than award
    points or change the verdict again.

------------------------------------------------------------------------

## 8. Database Design

Use Mongoose models with timestamps and indexes. The exact schema can
evolve, but preserve the security boundary between public content and
the solution.

### 8.1 Case document

Suggested fields:

  Field                          Type         Notes
  ------------------------------ ------------ --------------------------------------------------
  `_id`                          ObjectId     Case identifier
  `title`                        String       Required, length-limited
  `premise`                      String       User-submitted fictional premise
  `story`                        String       Case introduction
  `difficulty`                   Enum         Easy, Medium, Hard
  `status`                       Enum         active, completed, generation_failed
  `suspects`                     Array        Public suspect data
  `clues`                        Array        Clue metadata and content; serialize selectively
  `hints`                        Array        Hint content; return sequentially
  `solution.culpritId`           String       Server-only until completion
  `solution.explanation`         String       Server-only until completion
  `solution.keyClueIds`          String\[\]   Server-only until completion
  `progress.discoveredClueIds`   String\[\]   Unique discovered clues
  `progress.hintsUsed`           Number       Count of delivered hints
  `progress.nextHintIndex`       Number       Index of next hint
  `accusation.suspectId`         String       Set once at completion
  `result.isCorrect`             Boolean      Set on completion
  `result.score`                 Number       Server-calculated
  `result.scoreBreakdown`        Object       Base, clue points, penalty, total
  `createdAt`                    Date         Mongoose timestamp
  `updatedAt`                    Date         Mongoose timestamp
  `completedAt`                  Date         Null until completed

For production, consider storing solution data in a separate collection
or document with stricter internal access. At minimum, keep it out of
public serializers and API response types.

### 8.2 Identity and access

The MVP may allow anonymous play, but case IDs are not a substitute for
authorization. Use a random, high-entropy player/session token in a
secure, HTTP-only cookie or implement authentication. Bind case access
to the player/session and enforce ownership on every endpoint. If
anonymous session ownership is out of scope for a classroom prototype,
document the limitation and avoid claiming that case IDs alone secure
private cases.

### 8.3 Indexes and retention

-   Index `status` and `createdAt` if used for case management.
-   If using accounts, index owner ID and creation time.
-   Add a retention policy for abandoned anonymous cases if needed.
-   Never log API keys, session cookies, or full sensitive headers.

------------------------------------------------------------------------

## 9. REST API Specification

All endpoints are prefixed with `/api`. Use JSON request/response
bodies, HTTPS in production, consistent error shapes, and server-side
validation.

### 9.1 Standard error shape

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Difficulty must be Easy, Medium, or Hard.",
    "details": []
  }
}
```

Do not return stack traces, provider raw errors, secrets, prompts
containing internal solution details, or database internals to the
client.

### 9.2 `POST /api/cases`

**Purpose:** Generate and save a playable mystery.

Request:

``` json
{
  "premise": "A rare painting disappears during a locked-room exhibition.",
  "difficulty": "medium"
}
```

Success (`201 Created`), illustrative public response:

``` json
{
  "case": {
    "id": "case_id",
    "title": "The Missing Masterpiece",
    "story": "The gallery closed at 9 PM...",
    "difficulty": "medium",
    "status": "active",
    "suspects": [
      {
        "id": "suspect_1",
        "name": "Mira Vale",
        "description": "Gallery archivist",
        "motive": "A dispute over the painting",
        "alibi": "Claims to have been in the archive"
      }
    ],
    "clueSummaries": [
      { "id": "clue_1", "title": "Dust on the Frame", "location": "Main gallery", "discovered": false }
    ],
    "progress": {
      "discoveredClueCount": 0,
      "totalClues": 7,
      "hintsUsed": 0,
      "hintsAvailable": 3
    }
  }
}
```

The arrays above are abbreviated examples, not the required full counts.
No culprit or solution fields may appear.

Errors: `400 VALIDATION_ERROR`, `429 RATE_LIMITED`,
`502 AI_GENERATION_FAILED`, `503 SERVICE_UNAVAILABLE`.

### 9.3 `GET /api/cases/:id`

**Purpose:** Retrieve current public case state.

Success (`200 OK`): return the same safe case DTO plus progress. Return
discovered clue content only for clues already discovered by this
player/session. Undiscovered clue content must remain server-side.

Errors: `400 INVALID_CASE_ID`, `404 CASE_NOT_FOUND`,
`403 CASE_ACCESS_DENIED`.

### 9.4 `POST /api/cases/:id/clues/:clueId/discover`

**Purpose:** Discover one clue.

Request body: empty object.

Success (`200 OK`):

``` json
{
  "clue": {
    "id": "clue_1",
    "title": "Dust on the Frame",
    "content": "A clean outline suggests the frame was moved recently.",
    "location": "Main gallery"
  },
  "progress": {
    "discoveredClueCount": 1,
    "totalClues": 7
  }
}
```

Rules: - Case must be active and owned by the current player/session. -
Clue must belong to the case. - Repeat discovery must not award
additional points. It may return the already-discovered clue with
unchanged progress. - The server records discovery before responding.

Errors: `400 INVALID_CLUE_ID`, `403 CASE_ACCESS_DENIED`,
`404 CASE_OR_CLUE_NOT_FOUND`, `409 CASE_COMPLETED`.

### 9.5 `POST /api/cases/:id/hints`

**Purpose:** Return the next available hint.

Request body: empty object.

Success (`200 OK`):

``` json
{
  "hint": {
    "id": "hint_1",
    "content": "Compare each suspect's timeline with the gallery's closing time."
  },
  "progress": {
    "hintsUsed": 1,
    "hintsAvailable": 2
  }
}
```

Rules: - Case must be active. - Return hints in sequence. - Increase
`hintsUsed` only when a hint is successfully returned. - If no hints
remain, return `409 NO_HINTS_REMAINING`. - Prevent concurrent requests
from returning the same hint twice or exceeding the limit.

### 9.6 `POST /api/cases/:id/accuse`

**Purpose:** Submit the final accusation and calculate the result.

Request:

``` json
{
  "suspectId": "suspect_2"
}
```

Success (`200 OK`):

``` json
{
  "result": {
    "isCorrect": false,
    "score": 25,
    "scoreBreakdown": {
      "basePoints": 0,
      "cluePoints": 35,
      "hintPenalty": 10,
      "total": 25
    },
    "completedAt": "2026-10-25T12:00:00.000Z"
  }
}
```

Before completion, this response must not reveal the culprit or solution
explanation. The client should navigate to Results and fetch the
completed result.

Rules: - Validate suspect ID and case ownership. - Atomically transition
`active` to `completed`. - Evaluate correctness and score on the
server. - Store the accusation and result once. - If the same request is
retried after a timeout, return the existing result without changing
it. - A different accusation after completion must be rejected with
`409 CASE_ALREADY_COMPLETED`.

### 9.7 `GET /api/cases/:id/result`

**Purpose:** Retrieve the result after completion.

Success (`200 OK`):

``` json
{
  "result": {
    "isCorrect": true,
    "accusedSuspectId": "suspect_1",
    "culprit": {
      "id": "suspect_1",
      "name": "Mira Vale"
    },
    "explanation": "The timeline and two key clues contradict the alibi.",
    "keyClueIds": ["clue_1", "clue_3"],
    "score": 105,
    "scoreBreakdown": {
      "basePoints": 100,
      "cluePoints": 15,
      "hintPenalty": 10,
      "total": 105
    }
  }
}
```

Rules: - Return `409 CASE_NOT_COMPLETED` if the case is still active. -
Verify case ownership. - Do not expose results through a public endpoint
before completion.

### 9.8 Operational endpoints

Recommended: - `GET /health` --- liveness check only; no secrets or
detailed infrastructure information. - `GET /ready` --- optional
readiness check that verifies required dependencies safely.

------------------------------------------------------------------------

## 10. Validation, Security, and Reliability

### 10.1 Input validation

-   Validate path IDs before database queries.
-   Trim and length-limit the premise.
-   Use enum validation for difficulty and state.
-   Validate all AI output on the server.
-   Apply request body size limits.
-   Reject unexpected fields where practical.

### 10.2 Secret management

-   Store `GEMINI_API_KEY` and `MONGODB_URI` in local environment
    variables and the deployment platform's secret manager.
-   Commit `.env.example`, never `.env`.
-   Ensure `.env`, logs, and credentials are ignored by Git.
-   Rotate any key that is accidentally committed or exposed.
-   The frontend must contain no private Gemini or database credentials.

### 10.3 API protections

-   Configure CORS to allow only known frontend origins in production.
-   Add rate limits to case generation and hint endpoints.
-   Add timeouts and bounded retries for Gemini requests.
-   Use safe, generic error messages for provider failures.
-   Consider a request ID for tracing errors.
-   Use Helmet or equivalent secure HTTP headers.
-   Avoid rendering AI output as raw HTML; render as escaped text or
    sanitized Markdown if Markdown is supported.
-   Do not include internal prompts or hidden solution fields in
    application logs.

### 10.4 AI-specific safeguards

-   Treat the premise as untrusted user input, not as instructions to
    change system behavior.
-   Keep the generation prompt explicit about schema and fictional
    content.
-   Validate output structurally and semantically before saving.
-   Never allow model output to determine score directly.
-   Never trust a model-generated culprit ID without verifying it
    matches an existing suspect.
-   Fail closed: if generation or validation fails, do not create an
    active case with missing or inconsistent fields.

### 10.5 Concurrency and idempotency

-   Use guarded state updates so only one accusation can complete a
    case.
-   Ensure clue discovery is unique per case and player.
-   Ensure hint index and count cannot exceed the configured limit.
-   For generation requests, consider an idempotency key to avoid
    duplicate cases after network retries.
-   Use transactions when supported and appropriate; otherwise use
    conditional updates and test race conditions.

------------------------------------------------------------------------

## 11. Environment Configuration

Example `.env.example` for the backend:

``` dotenv
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
GEMINI_API_KEY=replace_me
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace_with_a_long_random_secret
```

Do not put real secrets in this file. Production values must be
configured in the hosting provider's secret settings.

------------------------------------------------------------------------

## 12. Testing Strategy

### 12.1 Unit tests

-   Difficulty configuration returns the exact suspect/clue/hint counts.
-   Score formula covers correct and incorrect accusations, all
    difficulties, zero clues, maximum hints, and minimum score of zero.
-   Schema rejects missing fields, duplicate IDs, wrong counts, and
    invalid culprit references.
-   Public DTO serializer never includes solution fields.
-   Clue and hint limits are enforced.

### 12.2 API integration tests

-   Valid case creation persists a playable case.
-   Invalid premise or difficulty returns `400`.
-   Gemini timeout or malformed JSON returns a controlled error and does
    not save an active case.
-   Case retrieval omits undiscovered clue content and all solution
    fields.
-   Clue discovery awards credit only once.
-   Hint usage cannot exceed the configured count.
-   Accusation completes a case and stores the score once.
-   Result endpoint refuses access before completion.
-   Completed cases reject additional gameplay mutations.
-   Case ownership checks block access from another session.

### 12.3 End-to-end tests

At minimum, verify: 1. Create an Easy case and finish it. 2. Create a
Medium case and use one hint. 3. Create a Hard case and discover
multiple clues. 4. Submit a wrong accusation and verify the result. 5.
Refresh the browser during an active case and confirm progress persists.
6. Simulate a generation failure and verify the retry experience. 7.
Confirm the deployed frontend calls the deployed backend successfully.

### 12.4 Manual QA checklist

-   [ ] All pages render on mobile and desktop.
-   [ ] All difficulty settings generate the correct counts.
-   [ ] No secret or solution data is visible in network responses
    before accusation.
-   [ ] Clues and hints cannot be farmed for extra points or unlimited
    use.
-   [ ] Duplicate accusation requests do not alter the result.
-   [ ] Errors are understandable and do not reveal internal details.
-   [ ] Refreshing an active case restores server state.
-   [ ] Production environment variables are configured.
-   [ ] Browser console and server logs have no critical errors.

------------------------------------------------------------------------

## 13. Deployment Plan

1.  Create the repository and commit the spec before implementation.
2.  Set up MongoDB Atlas or another reachable MongoDB deployment.
3.  Create a Gemini API key and configure it only on the backend.
4.  Build and test the Express API locally.
5.  Build and test the React/Vite frontend locally.
6.  Configure production CORS, environment variables, and HTTPS.
7.  Deploy the backend to a Node-compatible host.
8.  Deploy the frontend to a static hosting provider.
9.  Configure the frontend API base URL to point to the deployed
    backend.
10. Run health checks and the full end-to-end checklist against
    production.
11. Verify secret protection by inspecting browser network responses and
    the built frontend bundle.
12. Document live URLs and any known limitations in `README.md`.

Deployment provider selection is intentionally flexible. Confirm the
chosen provider's current Node.js, environment-variable, build, and
MongoDB network requirements before deployment.

------------------------------------------------------------------------

## 14. Acceptance Criteria

The MVP is complete when all criteria below are met.

### Gameplay

-   [ ] A player can create a mystery from a valid premise.
-   [ ] Easy generates exactly 3 suspects, 5 clues, and 2 hints.
-   [ ] Medium generates exactly 4 suspects, 7 clues, and 3 hints.
-   [ ] Hard generates exactly 5 suspects, 9 clues, and 3 hints.
-   [ ] Players can discover clues, request hints, and submit an
    accusation.
-   [ ] Players can start another mystery after viewing results.

### Security and correctness

-   [ ] Culprit ID, solution explanation, and solution-only metadata are
    absent from all pre-accusation responses.
-   [ ] Undiscovered clue content is not sent to the client.
-   [ ] The server validates AI output before saving a playable case.
-   [ ] The backend calculates score using the documented formula.
-   [ ] Repeated clue, hint, and accusation requests cannot manipulate
    score or state.
-   [ ] Results reveal the stored culprit and explanation only after
    completion.
-   [ ] Case access is tied to a player/session or authentication
    mechanism.

### Quality and deployment

-   [ ] Loading, validation, network, generation, not-found, and
    rate-limit states are implemented.
-   [ ] The UI is usable on mobile and desktop.
-   [ ] Unit and API tests cover scoring and security invariants.
-   [ ] The deployed website completes a full mystery from creation
    through results.
-   [ ] README explains setup, environment variables, test commands, and
    deployment.

------------------------------------------------------------------------

## 15. Final Deliverables

1.  `SPEC.md` --- this implementation blueprint.
2.  Working React/Vite/Tailwind frontend.
3.  Working Node.js/Express backend.
4.  Mongoose data model and MongoDB persistence.
5.  Gemini integration with schema validation and bounded retries.
6.  Automated tests for scoring, case state, and answer secrecy.
7.  `.env.example` with placeholders only.
8.  `README.md` with setup and deployment instructions.
9.  Live frontend and backend URLs.
10. A short demonstration of creating, investigating, accusing, and
    viewing results.

------------------------------------------------------------------------

## 16. Implementation Order

Implement in this order to reduce rework:

1.  **Freeze the contract:** review and commit `SPEC.md`.
2.  **Scaffold the repository:** client, server, scripts, linting, and
    environment examples.
3.  **Build schemas and scoring first:** write tests for difficulty
    counts, score calculations, and answer secrecy.
4.  **Implement API with fixture data:** validate gameplay without
    depending on Gemini.
5.  **Implement MongoDB persistence and session ownership.**
6.  **Build the UI against the API contract.**
7.  **Integrate Gemini:** generate structured cases, validate them, and
    add bounded retries.
8.  **Run security and end-to-end tests.**
9.  **Deploy and verify the complete live flow.**
10. **Polish visuals and optional enhancements only after the MVP is
    reliable.**

**Engineering principle:** A mystery that looks good but has
contradictory clues or leaks the culprit is not a successful
implementation. Prioritize a fair, secure, repeatable game loop before
visual extras.
