# Bidx | Professional Auction Management Ecosystem

Bidx is a state-of-the-art, multi-tenant auction platform designed for professional sports leagues and competitive events. Built with a focus on high-fidelity user experiences and real-time data integrity, Bidx offers a comprehensive ecosystem for administrators, team owners, and auctioneers.

![Banner](https://img.shields.io/badge/System-Multi--Tenant-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Build-Vite%20%2B%20React%20%2B%20TS-blue?style=for-the-badge)

## 🏗 System Architecture & Roles

The platform is divided into four distinct panels, each tailored for a specific user role and workflow.

---

### 👑 1. Super Admin Panel
The hub for global platform management and system-wide configuration.

- **Tenant Lifecycle**: Create and manage multiple tournament "Tenants," each with its own isolated database and settings.
- **Global Settings**: Configure tournament-wide parameters like "Players per Team," "Total Overs," "Purse Limits," and "Bid Increments."
- **Tenant Overview**: Real-time status monitoring of all active tournaments.
- **System Settings**: Manage global configurations that propagate across the entire ecosystem.

---

### 🛠 2. Tenant Admin Panel (Tournament Organizer)
The primary interface for tournament organizers to orchestrate their specific auction.

- **Intelligent Dashboard**:
  - Live statistics for all registered entities.
  - Auction progress tracking (Sold vs Unsold count).
  - Purse budget utilization analytics.
  - Real-time activity feed of tournament events.
- **Entity Management**:
  - **Players**: Complete cricketing profile management with photo uploads, technique styles, and role categorization.
  - **Teams**: Manage team identity, logos, and short codes.
  - **Owners**: Unified user account creation and wallet/purse management.
- **Data Operations**:
  - **Bulk Import**: High-speed CSV/Excel uploads for players, teams, and owners.
  - **Advanced Filtering**: Instant search and multi-criteria filters (by role, team, or owner).

---

### 💼 3. Owner Panel
A dedicated workspace for team owners to manage their franchise and strategy.

- **Franchise Dashboard**: High-level overview of team composition and financial health.
- **Budget Management**: Real-time monitoring of remaining purse amounts and spending trends.
- **Bidding History**: Detailed logs of every bid placed by the franchise during the auction.
- **Squad View**: View signed players with their full profiles and performance categories.

---

### 🎤 4. Auctioneer Panel
The high-pressure interface designed for live event execution.

- **Live Auction Control**: Real-time bidding interface with sub-second synchronization.
- **Bid Management**: Instant bid acknowledgement and "Sold/Unsold" markings.
- **Real-time Synchronization**: Powered by high-efficiency API communication to ensure all users see the same bid simultaneously.

---

## 🛠 Technology Stack

- **Frontend**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type-safe development and documentation.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom "Premium Dark" design system.
- **State**: [Zustand](https://github.com/pmndrs/zustand) for performant, modular global state.
- **Network**: [Axios](https://axios-http.com/) using a structured service-layer pattern.
- **Components**: 
  - Icons: [Lucide React](https://lucide.dev/)
  - Feedback: [React Hot Toast](https://react-hot-toast.com/) & [SweetAlert2](https://sweetalert2.github.io/)
  - Image Logic: [React Image Crop](https://github.com/DominicVilsmeier/react-image-crop)

## 🚀 Getting Started

1.  **Installation**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Configure `VITE_API_BASE_URL` in your `.env` file to point to your backend service.
3.  **Development**:
    ```bash
    npm run dev
    ```
4.  **Production Build**:
    ```bash
    npm run build
    ```

## 📂 Directory Structure

```text
src/
├── api/             # Scoped services (playerService, teamService, etc.)
├── components/      # UI primitives and shared shared modules
├── pages/
│   ├── super-admin/  # Tenant management & global config
│   ├── admin/        # Tenant-specific orchestration
│   ├── owner/        # Franchise management
│   └── auctioneer/   # Live bidding execution
├── store/           # Zustand stores for Auth and Tenant context
└── utils/           # Shared helpers and formatters
```

---
*Bidx is engineered for the adrenaline of the auction floor. Precision. Speed. Power.*
