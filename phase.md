# EEC Phase-Wise Feature Plan

This document groups the platform capabilities into three delivery waves. Phase 1 reflects what is already implemented in the repository today. Phase 2 builds on that foundation with higher-value enhancements that are mostly scaffolded in code but need integration or refinement. Phase 3 captures the advanced, ML-driven ambitions that will require new modelling work and production-grade data ingestion.

## Phase 1 – Core Platform (current coverage)
- **Frontend**
  - Multi-role dashboards and navigation for students, teachers, parents, admins, and principals (`frontend/src/{components,teachers,parents,admin,principal}`).
  - Student essentials: attendance, assignments, courses, results, profile updates, notices, theme customiser, feedback (`frontend/src/components/*View.jsx`).
  - Teacher workspace: attendance, assignment management/evaluation, lesson planning, meetings (`frontend/src/teachers`).
  - Parent engagement: academic/attendance reports, PTM portal, fees, complaints, observation tools (`frontend/src/parents`).
  - Principal leadership views: analytics, finances, staff, notifications, quick actions (`frontend/src/principal`).
  - Shared UI/UX foundation: Tailwind theming, role-based routing, floating pet/games modules (`frontend/src/components`, `frontend/src/games`).
- **Backend**
  - Authentication stacks and JWT sessions for all roles (`backend/routes/*Route.js`) with admin-managed onboarding (`backend/routes/adminUserManagement.js`, `backend/utils/generator.js`).
  - Core data services: attendance, assignments, courses, subjects, exams, feedback, behaviour, student profiles (`backend/routes/{attendance,assignment,course,subject,exam,feedback,behaviour}Route.js`).
  - Parent/teacher/student domain models and admin controls (`backend/models/*.js`).
  - Progress tracking scaffolding with submissions, metrics, and intervention flags (`backend/routes/progressRoute.js`, `backend/models/StudentProgress.js`).
- **ML/AI**
  - Rule-based AI learning endpoints and mock content generators for students and teachers (`backend/routes/aiLearningRoute.js`, `backend/routes/studentAILearningRoute.js`).
  - Frontend AI study and teaching dashboards consuming mock data (`frontend/src/components/AI*.jsx`, `frontend/src/teachers/AIPoweredTeaching.jsx`).

## Phase 2 – Enhanced Insights & Collaboration (short-term expansion)
- **Frontend**
  - Integrate live analytics widgets into existing dashboards using progress metrics and attendance trends (`frontend/src/components`, `frontend/src/admin/pages`, `frontend/src/principal`).
  - Enable AI learning & teaching UIs to read/write persistent data, show usage telemetry, and surface intervention alerts (`frontend/src/components/AI*`, `frontend/src/teachers/AIPoweredTeaching.jsx`).
  - Finalise communication modules: chats, meeting planners, notifications with real-time UX (`frontend/src/parents/ParentChat.jsx`, `frontend/src/teachers/TeacherChat.jsx`, `frontend/src/principal/NotificationCenter.jsx`).
  - Expand wellness/behaviour/gamified experiences with dedicated dashboards and progress views (`frontend/src/parents/HealthReport.jsx`, `frontend/src/teachers/StudentObservation.jsx`, `frontend/src/games`).
  - Automate admin/principal workflows (imports, approvals, timetables, finance) leveraging existing page scaffolds (`frontend/src/admin/pages/*`, `frontend/src/principal`).
- **Backend**
  - Expose richer analytics APIs by wiring progress metrics, attendance stats, and intervention flags into role-based endpoints (`backend/routes/progressRoute.js`, `backend/routes/attendanceRoutes.js`).
  - Persist AI study interactions, teaching artefacts, and recommendation telemetry (`backend/models/StudentProgress.js`, new collections for quizzes/flashcards).
  - Stand up chat/notification data stores and real-time gateways (e.g., WebSocket/SSE adapters) for parent/teacher/principal communications.
  - Extend behaviour, health, and game tracking services with dedicated models and reporting endpoints.
  - Add automation utilities for bulk data operations, timetable generation, and finance feeds.
- **ML/AI**
  - Enhance current heuristic analysers with data-driven scoring (e.g., aggregation jobs, rule tuning) on top of `StudentProgress` records.
  - Implement recommendation heuristics for study plans, flagging, and teacher insights using stored interaction data.
  - Prepare data pipelines for future ML by standardising event capture and labelling within existing services.

## Phase 3 – ML-Driven Personalisation & Prediction (long-term vision)
- **Frontend**
  - Surface predictive risk scores, recommended interventions, and personalised content directly in role dashboards (`frontend/src/{students,teachers,parents,admin,principal}`).
  - Add adaptive study journeys with dynamically generated learning artefacts (quizzes, flashcards, mind maps) driven by ML outputs.
  - Provide cross-role insight hubs blending academic, behavioural, financial, and operational forecasts (`frontend/src/principal`, `frontend/src/admin/pages`).
- **Backend**
  - Replace heuristic analytics with ML-powered services for academic risk prediction, attendance anomalies, and operational forecasting (`backend/routes/aiLearningRoute.js`, new predictive endpoints).
  - Build data ingestion, feature computation, and serving layers (message queues, ETL jobs, feature stores) to support production ML workloads.
  - Orchestrate automated recommendations, mentor matching, and alerting pipelines integrated with communication services.
- **ML/AI**
  - Train and deploy predictive models for student performance, intervention timing, and resource allocation using historical submissions, attendance, behaviour, and finance data (`backend/models/StudentProgress.js` extended with feature snapshots).
  - Integrate LLM/GenAI providers for curriculum-aligned content generation, adaptive assessment, and conversational tutoring.
  - Establish ML Ops foundations: experiment tracking, model registry, continuous evaluation, bias monitoring, and governance to keep recommendations trustworthy.
++ End Patch

Each phase is additive: Phase 1 is shippable today, Phase 2 deepens engagement and insight using the existing code scaffolds, and Phase 3 elevates the platform with production-grade machine learning and predictive intelligence.
