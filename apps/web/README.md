# PostWins Web Client 🌐

The **PostWins** is a Next.js App Router application that
provides the primary user interface for interacting with the PostWins
workflow platform.

It enables users to:

- manage cases
- review verification activity
- submit evidence
- communicate through messaging
- inspect explainable system decisions
- track workflow progress

The frontend is designed to expose **transparent system behavior**,
ensuring users can understand how cases move through the platform.

---

# Architecture 🏗️

The frontend follows a **feature-oriented architecture** built around
domain-aligned UI modules and deterministic state management.

### Core Priorities

**Mobile-first workflows**\
The UI is optimized for mobile interactions while scaling to tablet and
desktop layouts.

**Deterministic UI state**\
Domain stores maintain predictable state transitions for cases,
messaging, and workflow progress.

**Explainable system interactions**\
Users can inspect system decisions, routing outcomes, and lifecycle
transitions.

**Resilient communication**\
Offline queues and request replay mechanisms ensure system reliability
under unstable networks.

---

# Application Domains 🌐

The frontend mirrors backend domain capabilities through UI modules.

Domain Responsibility

---

Cases Case browsing, selection, and lifecycle visibility
Messaging Real-time chat and communication
Evidence Evidence upload and review
Execution Progress tracking and milestone completion
Routing Workflow navigation and task context
Explainability System reasoning and decision inspection
Authentication Login and session management

---

# Frontend Structure 🧩

    apps/web
    ├── public/
    │
    ├── src/
    │   ├── app/                # Next.js App Router pages
    │   ├── components/         # Shared UI components
    │   ├── hooks/              # Custom React hooks
    │   ├── lib/                # API clients and utilities
    │   ├── services/           # WebSocket and domain services
    │   └── utils/              # Navigation and helpers

---

# Next.js Routing 🧭

The application uses **Next.js App Router**.

Routes are defined inside:

    src/app

Example routes:

    auth/login
    postwins
    postwins/detailsPage/[id]

Capabilities include:

- server rendering
- route-based layouts
- progressive hydration

---

# Component Architecture 🎨

UI components are organized by **feature context**.

Primary UI modules exist inside:

    src/app/postwins/_components

Major UI groups include:

    chat
    details
    layout
    navigation
    explain

These power the main application interface including:

- chat conversations
- case details panels
- workflow visualization
- system explanation panels

---

# State Management 🧠

The application uses **domain stores** to manage UI state.

Examples:

    useCasesStore.ts
    usePostWinStore.ts
    useAuthStore.ts

Stores handle:

- case lists
- selected case state
- authentication sessions
- optimistic UI updates

State is designed to remain **predictable and serializable**.

---

# API Layer 🔌

API communication is implemented in:

    src/lib/api

Key components include:

    apiClient.ts
    auth.api.ts
    contracts/

Domain API contracts define request and response shapes.

Example contract modules:

    contracts/domain/cases.api.ts
    contracts/domain/intake.api.ts
    contracts/domain/message.ts
    contracts/domain/postwins.api.ts

These mirror backend domain APIs and provide type-safe communication.

---

# Offline Support 📡

The frontend includes an **offline request handling system**.

Located in:

    src/lib/offline

Capabilities include:

- request queuing
- network detection
- request replay
- payload serialization

This allows the application to remain usable during unstable
connectivity.

---

# Messaging System 💬

Real-time communication is implemented through:

    services/websocket.service.ts

Messaging UI lives inside:

    components/chat

Features include:

- live message streaming
- read receipts
- message presence
- attachment handling

---

# Explainability Interface 🔍

The platform exposes internal system reasoning through UI components.

Example components:

    ExplainCasePanel.tsx
    LedgerTrail.tsx
    DecisionHistory.tsx
    LifecycleExplanation.tsx
    RoutingCounterfactual.tsx

These components allow users to inspect:

- lifecycle decisions
- routing outcomes
- ledger events
- historical system decisions

---

# Running the Frontend 🚀

From the monorepo root:

Install dependencies

    pnpm install

Run only the web client

    pnpm --filter web dev

Run the entire platform

    pnpm dev

Application runs at:

    http://localhost:3000

---

# Development Principles 🧠

The frontend follows several engineering principles.

- Feature ownership over shared complexity
- Composable UI components
- Deterministic state management
- Mobile-first design
- Transparent system behavior

---

# Quick System Orientation

To understand the frontend quickly, read these files first:

    src/lib/api/apiClient.ts
    src/app/postwins/_components/layout/MobileChatScreen.tsx
    src/app/postwins/_components/explain/ExplainCasePanel.tsx

Together these files reveal:

    API communication
    + primary UI workflow
    + explainability interface
    = PostWins frontend architecture
