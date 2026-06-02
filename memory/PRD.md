# Marketplace — Student Marketplace MVP

## Original Problem Statement
A modern student marketplace called "Marketplace" built with React + Tailwind + Firebase (Auth/Firestore/Storage) + Framer Motion. Platform must start completely empty — no fake listings. Email-verified login, real-time listings via Firestore snapshots, image upload to Firebase Storage, edit/delete only by the owner.

## Architecture
- React (CRA) frontend at `/app/frontend`
- Direct integration with Firebase project `rit-marketplace`
- No FastAPI backend used; data layer is Firestore
- Auth persistence: `browserLocalPersistence`
- Routing: `react-router-dom` with `ProtectedRoute` guard (requires verified email)

## User Personas
- Student seller: posts items they want to sell.
- Student buyer: browses listings and contacts the seller directly.

## Core Requirements (static)
- Email/password auth with verification
- Personal Firestore user doc on signup (no preloaded data)
- Real-time `listings` collection
- Owner-only edit/delete
- Categories: Books & Notes, Electronics, Furniture, Dorm Essentials, Gaming, Clothing, Bikes & Transport, Tickets, Other

## What's been implemented (2026-02)
- Firebase config + auth/Firestore/Storage init
- AuthContext: signup, login, logout, sendEmailVerification, ensureUserDoc, refreshUser
- Pages: AuthPage (split-screen), VerifyEmail (poll + resend cooldown), Dashboard (search + category filter + onSnapshot grid), CreateListing (drag-drop upload), ListingDetails (owner edit/delete), MyListings, AccountSettings
- Components: Navbar (dark, with profile dropdown + My Listings/Logout), ProtectedRoute, ListingCard, EmptyState (premium illustration), ListingSkeleton, DragDropImage
- Firestore + Storage security rules at `/app/firestore.rules` and `/app/storage.rules`
- Fonts: Satoshi + General Sans via Fontshare; orange accent `#FF5A1F`
- All interactive elements have `data-testid`s
- Verified via testing agent: 10/11 critical checks pass (one cosmetic warning fixed afterwards)

## Backlog (P1/P2)
- P1: Push the security rules to Firebase console (currently checked into repo only)
- P1: Profile photo upload to Firebase Storage on AccountSettings
- P1: Password reset flow ("Forgot password")
- P2: Save/favorite listings, message seller in-app
- P2: Multiple images per listing carousel
- P2: Server-side pagination / infinite scroll for scale

## Next Action Items
- User should enable Email/Password sign-in in Firebase console and deploy `firestore.rules` + `storage.rules`
- Verify a real signup via inbox to confirm end-to-end create-listing works against rules
