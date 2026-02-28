# ArtomilyAI – Master Planning Document

## 0. Vision

ArtomilyAI adalah AI-powered content generation platform
yang memungkinkan user membuat:

- Text (caption, script, copywriting)
- Image (poster, meme, flyer)
- Video (animation, short promo)
- Tempaltes (Ramadhan, Imlek, National Day, Trending Meme, Viral Template)

Monetisasi berbasis:
- Subscription
- Credit usage (balance system)
- Top-up credit

---

# 1. Product Phases Roadmap

## Phase 1 – Landing & Validation
Goal: Validate demand

- Landing page
- Feature explanation
- Pricing preview
- Email waitlist
- Basic auth (register/login)
- Static demo content

Deliverable:
- Public landing page
- Waitlist collection

---

## Phase 2 – Core MVP (AI + Credit System)

Goal: Launch working generator

Features:
- Auth system
- Wallet balance system
- Generate text/image
- Credit deduction
- Transaction logging
- User library (private)
- Stripe subscription integration

Deliverable:
- Working AI generation
- Credit-safe system
- Basic dashboard

---

## Phase 3 – Portfolio & Monetization Upgrade

Goal: Increase retention & growth

Features:
- Public portfolio (/u/username)
- Toggle public/private
- Template system
- Priority queue for Pro
- Watermark control
- Usage analytics

Deliverable:
- Viral loop via portfolio sharing
- Revenue stabilization

---

## Phase 4 – Scaling & Optimization

Goal: Sustainable AI cost structure

Features:
- Dynamic cost engine
- Token-based billing
- Queue tiering
- Cold storage
- Admin panel (cost control)
- AI provider fallback

Deliverable:
- Controlled margin
- Scalable infra

---

# 2. System Architecture Overview

Client → API → Credit Check → Queue → Worker → AI → Storage → DB

Core Systems:

1. Auth Service
2. Credit Engine
3. Subscription Engine
4. AI Job Processing Engine
5. Library & Portfolio Engine
6. Admin & Cost Monitoring

---

# 3. Tech Stack

## Frontend
- Next.js (App Router)
- TailwindCSS
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
- Zod

## Backend
- Next.js API Routes
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- Stripe

## Storage
- AWS S3 (or compatible object storage)

---

# 4. Monetization Model

## 4.1 Credit-Based Usage

Each action consumes credit:

| Action | Cost |
|--------|------|
| Text | 1 |
| Image | 5 |
| Video | 20 |
| Upscale | 3 |

Rules:
- Deduct before queue
- Refund if failed
- Lock credit during processing

---

## 4.2 Subscription Plans

Free
- 20 credits/month
- Watermark
- No public portfolio

Creator ($29/mo)
- 300 credits
- No watermark
- Public portfolio
- Priority queue

Pro Brand ($79/mo)
- 1000 credits
- Faster processing
- Brand memory

Renewal Flow:
- Stripe webhook
- Add monthly credits
- Update expiry

---

# 5. Credit Lifecycle

1. User request generation
2. API validates
3. Credit service checks balance
4. Deduct + create transaction
5. Push job to queue
6. Worker processes AI
7. Save result
8. If failed → refund

---

# 6. Database Structure

## users
- id
- email
- username
- password
- plan
- wallet_balance
- subscription_status
- subscription_expiry
- created_at

## generations
- id
- user_id
- type
- prompt
- result_url
- cost
- status
- is_public
- created_at

## transactions
- id
- user_id
- type
- amount
- reference_job_id
- created_at

## subscriptions
- id
- user_id
- stripe_subscription_id
- status
- current_period_end

---

# 7. Queue System

Two-tier queue:

Free → Standard queue  
Pro → Priority queue  

Worker pools separated.

Safety:
- Retry limit
- Timeout
- Max concurrent jobs per user
- Rate limiting

---

# 8. Portfolio System

Private Library:
- All generations stored

Public Portfolio:
- Toggle is_public
- URL: /u/username
- Grid gallery
- Shareable

Future:
- Like system
- Creator ranking
- Marketplace template

---

# 9. Cost Control Strategy

AI is main cost driver.

Control methods:

- Token-based cost calculation
- Limit max prompt length
- Limit max image size
- Monthly credit expiration
- Cold storage after 6 months
- AI provider switching logic

Target:
AI cost < 30–40% of subscription revenue

---

# 10. Admin Panel (Internal)

Admin can:

- Set credit cost per action
- View total AI spending
- View revenue vs cost
- Ban abusive users
- Adjust plan credit allocation

---

# 11. Security Considerations

- Stripe webhook signature verification
- Credit lock to avoid double spending
- Rate limit per IP
- JWT auth
- Storage signed URL
- Background job idempotency

---

# 12. Scaling Strategy

Stage 1:
- Single app + Redis

Stage 2:
- Separate worker service

Stage 3:
- Microservices:
  - Auth Service
  - Credit Service
  - Generation Service

Stage 4:
- Multi-region deployment
- CDN for media

---

# 13. Future Expansion

- Agency Plan
- Team workspace
- White-label SaaS
- API access
- Creator marketplace
- Revenue share model

---

# 14. KPI Metrics

Track:

- CAC
- LTV
- AI cost per user
- Average credit usage
- Subscription conversion rate
- Portfolio share rate

---

# 15. Risk Analysis

Risk: AI cost spike  
Mitigation: dynamic cost engine

Risk: abuse by free users  
Mitigation: strict rate limit + watermark

Risk: low retention  
Mitigation: portfolio system + template updates

---

# 16. Long-Term Vision

Evolve from:

AI Generator

Into:

AI Cultural Content Infrastructure Platform

Core asset:
- Cultural template engine
- Brand voice personalization
- Creator ecosystem
- Marketplace

---

# Final Summary

ArtomilyAI is designed as:

- Credit-controlled AI SaaS
- Subscription-based platform
- Portfolio-driven growth engine
- Scalable job processing system
- Cost-optimized AI infrastructure

From Landing Page
→ MVP
→ Monetized Platform
→ Scalable AI SaaS
→ Cultural AI Infrastructure