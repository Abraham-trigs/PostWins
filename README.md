# PostWins Platform 🚀

PostWins is a **deterministic workflow platform** designed to manage
complex operational processes such as case handling, verification,
routing, execution tracking, and decision transparency.

The platform is built as a **monorepo** containing multiple applications
and shared packages that together power the full PostWins ecosystem.

The system prioritizes:

-   explainable decision systems
-   deterministic workflows
-   domain-driven architecture
-   transparent operational processes
-   scalable engineering practices

------------------------------------------------------------------------

# Repository Overview 🧭

This repository contains the complete PostWins platform including:

  Project        Purpose
  -------------- ---------------------------------------------------------
  apps/backend   Core workflow engine and API
  apps/web       Main application client used by operators
  apps/website   Public-facing product and documentation website
  packages       Shared contracts and utilities used across applications

The monorepo structure allows all platform components to evolve together
while sharing types, contracts, and infrastructure.

------------------------------------------------------------------------

# Monorepo Structure 🧩

    .
    ├── apps/
    │   ├── backend/      # Workflow engine and API
    │   ├── web/          # Operator application UI
    │   └── website/      # Public marketing and documentation site
    │
    ├── packages/
    │   └── core/         # Shared contracts and domain types
    │
    ├── pnpm-workspace.yaml
    ├── turbo.json
    └── package.json

------------------------------------------------------------------------

# Platform Architecture 🏗️

PostWins operates as a **policy-driven workflow system** where
operational actions are evaluated through explicit logic rather than
hidden condition chains.

The system architecture consists of three primary layers:

    Frontend Applications
            ↓
    Backend Workflow Engine
            ↓
    Database + Ledger

Key architectural components include:

-   **Domain modules** for each business capability
-   **Policy evaluation engines** for decision logic
-   **Ledger-backed auditability**
-   **Real-time messaging and event tracking**
-   **Deterministic case lifecycle management**

------------------------------------------------------------------------

# Core Applications 🌐

## Backend

Location:

    apps/backend

The backend acts as the **workflow orchestration engine** responsible
for:

-   case lifecycle management
-   verification workflows
-   routing decisions
-   evidence processing
-   financial disbursement logic
-   messaging infrastructure
-   explainable decision systems

See:

    apps/backend/README.md

for detailed backend architecture.

------------------------------------------------------------------------

## Web Application

Location:

    apps/web

The web client is the primary interface for operators interacting with
the PostWins platform.

Capabilities include:

-   case management
-   messaging and collaboration
-   evidence submission
-   explainable decision inspection
-   workflow monitoring

See:

    apps/web/README.md

for frontend architecture documentation.

------------------------------------------------------------------------

## Website

Location:

    apps/website

The website communicates the PostWins platform to external audiences
including partners, organizations, and stakeholders.

It provides:

-   architecture explanations
-   platform capabilities
-   stakeholder experiences
-   demo request flows
-   product documentation

See:

    apps/website/README.md

for website architecture documentation.

------------------------------------------------------------------------

# Shared Packages 📦

Shared logic lives inside:

    packages/

Currently the repository includes:

    packages/core

This package contains:

-   shared domain contracts
-   cross-application types
-   reusable domain utilities

Shared packages allow the backend and frontend to operate using
**consistent type contracts**.

------------------------------------------------------------------------

# Development Workflow 🛠️

The repository uses:

-   **pnpm workspaces** for dependency management
-   **Turborepo** for task orchestration
-   **TypeScript** across all applications

------------------------------------------------------------------------

# Running the Platform 🚀

From the repository root:

Install dependencies:

    pnpm install

Run all applications:

    pnpm dev

Run specific applications:

Backend:

    pnpm --filter backend dev

Web client:

    pnpm --filter web dev

Website:

    pnpm --filter website dev

------------------------------------------------------------------------

# Engineering Principles 🧠

The PostWins platform follows several core engineering principles.

**Domain-driven architecture**\
Business capabilities are organized into explicit modules.

**Deterministic workflows**\
Operational processes are implemented as explicit lifecycle transitions.

**Explainable decisions**\
System behavior can always be inspected and understood.

**Shared contracts**\
Frontend and backend share types to prevent API drift.

**Scalable monorepo design**\
Applications and packages evolve together within a unified workspace.

------------------------------------------------------------------------

# Quick System Orientation

To quickly understand the platform architecture, review these files:

    apps/backend/src/modules/cases/transitionCaseLifecycleWithLedger.ts
    apps/backend/src/modules/policies/policy-evaluation.service.ts
    apps/web/src/lib/api/apiClient.ts

Together these reveal:

    workflow engine
    + policy evaluation
    + application interface
    = PostWins platform architecture

------------------------------------------------------------------------

# Contributing

Contributions should follow the existing architecture patterns:

-   domain modules for backend logic
-   feature-driven components in the frontend
-   shared contracts for cross-application types

All new functionality should maintain:

-   deterministic workflows
-   clear system boundaries
-   strong observability




apps/web/src/lib/api/apiClient.ts

These files reveal the core behavior of the PostWins platform.

