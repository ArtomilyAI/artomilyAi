# AGENT.md

## Project Name
ArtomilyAI – AI Content Generator

---

## 1. Product Overview

ArtomilyAI adalah AI generative platform berbasis:
- Text generation
- Image generation
- Video generation
- template system (Ramadhan, Imlek, Meme, dll)

Target:
- Creator
- UMKM
- Brand lokal
- Social media marketer

---

## 2. Core Features

### A. AI Generation
- Text (caption, script, post)
- Image (flyer, meme, poster)
- Video (animation from image)

### B. Templates
- Ramadhan
- Lunar New Year
- Trending Meme
- National Holiday
- Template AI Viral

### C. Personalization
User memiliki:
- Writing style
- Tone
- Color dominance
- Brand voice

---

## 3. Tech Stack

### Frontend
- Next.js (App Router)
- TailwindCSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Zustand

### Backend
- Next.js API Routes
- BullMQ
- Redis
- PostgreSQL (Prisma)

---

## 4. Architecture Overview

Client → Next.js API → Queue → Worker → AI → Storage → DB

---

## 5. Folder Structure

apps/web
- app/
- components/
- lib/
- store/
- hooks/
- services/

---

## 6. State Management Rules

- Zustand → global UI state
- TanStack Query → server state
- React Hook Form → form handling
- Zod → validation schema

---

## 7. Coding Principles

- Never call AI directly in component
- Always abstract business logic into services
- UI must be reusable component
- API must validate with Zod
- Keep prompt builder separate

---

## 8. Future Enhancements

- Credit system
- Multi-tenant SaaS
- AI training per user
- Engagement analytics