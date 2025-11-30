# Venue Ease

A hotel venue search and booking inquiry system built for team offsites and corporate events.

## Architecture

Clean layered architecture with separation of concerns:

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (thin controllers)
│   │   ├── venues/        # GET /api/venues, GET /api/venues/[slug]
│   │   │   └── [slug]/bookings/  # GET booked dates
│   │   └── bookings/      # POST /api/bookings
│   ├── venues/[slug]/     # Venue detail page
│   └── page.tsx           # Home (venue listing)
├── services/              # Business logic + validation
├── repositories/          # Data access layer
├── components/            # React components
│   └── ui/               # Radix UI primitives
├── lib/                   # Utilities, errors, validations
└── types/                 # TypeScript definitions
```

**Request Flow:**

```
HTTP Request
    ↓
Route Handler (validates input with Zod)
    ↓
Service Layer (business logic, throws AppError)
    ↓
Repository Layer (Prisma queries)
    ↓
PostgreSQL
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)

### Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd venue-ease
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# 3. Setup database
npm run db:push    # Push schema
npm run db:seed    # Seed with sample venues

# 4. Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Required: PostgreSQL connection (pooled recommended)
POSTGRES_PRISMA_URL="postgresql://user:pass@host:5432/dbname"

# Optional: Direct connection for migrations
POSTGRES_URL_NON_POOLED="postgresql://user:pass@host:5432/dbname"
```

## Scripts

| Script              | Description               |
| ------------------- | ------------------------- |
| `npm run dev`       | Start development server  |
| `npm run build`     | Build for production      |
| `npm run lint`      | Run ESLint                |
| `npm run test`      | Run tests in watch mode   |
| `npm run test:run`  | Run tests once            |
| `npm run db:push`   | Push schema to database   |
| `npm run db:seed`   | Seed with 8 sample venues |
| `npm run db:studio` | Open Prisma Studio GUI    |

## API Endpoints

### GET /api/venues

List venues with filtering and pagination.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Partial match on name or city |
| `minCapacity` | number | Minimum attendee capacity |
| `maxPrice` | number | Maximum price per night |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |

**Response:** `200 OK`

```json
{
  "data": [{ "id": 1, "slug": "grand-ballroom-sf", "name": "...", ... }],
  "pagination": { "page": 1, "limit": 10, "total": 8, "totalPages": 1 }
}
```

### GET /api/venues/[slug]

Get venue details by slug.

**Response:** `200 OK` or `404 VENUE_NOT_FOUND`

### GET /api/venues/[slug]/bookings

Get booked date ranges for availability calendar.

**Response:** `200 OK`

```json
{
  "data": [{ "startDate": "2025-03-01", "endDate": "2025-03-05" }]
}
```

### POST /api/bookings

Submit a booking inquiry.

**Request Body:**

```json
{
  "venueId": 1,
  "companyName": "Acme Inc",
  "email": "contact@acme.com",
  "startDate": "2025-03-01",
  "endDate": "2025-03-05",
  "attendeeCount": 50,
  "message": "Optional notes"
}
```

**Validations:**

- Venue must exist → `404 VENUE_NOT_FOUND`
- `attendeeCount ≤ venue.capacity` → `400 CAPACITY_EXCEEDED`
- No overlapping bookings → `409 DATES_UNAVAILABLE`
- Start date ≥ today, end date > start date

**Response:** `201 Created`

## Design Decisions & Tradeoffs

### 1. Layered Architecture (Route → Service → Repository)

**Why:** Clear separation of concerns. Routes handle HTTP, services contain business logic, repositories abstract data access. Easy to test services in isolation by mocking repositories.

**Tradeoff:** More files than putting everything in route handlers. Worth it for maintainability.

### 2. App-Level Availability Check (Not DB-Level)

**Why:** The current overlap detection happens in the service layer:

```typescript
const conflicts = await bookingRepository.findOverlapping(venueId, startDate, endDate);
if (conflicts.length > 0) throw new AppError(DATES_UNAVAILABLE, ...);
```

**This is appropriate because:**

- Bookings go to "pending" status, not auto-confirmed
- Low probability of exact same venue + dates + millisecond collision
- Simpler to debug than DB constraints

**When need DB-level EXCLUDE constraint:**

- Auto-confirmed bookings (no human review)
- High-value inventory (concert tickets, airline seats)
- Thousands of concurrent users on same inventory

### 3. URL-Based Filter State

**Why:** Filters stored in URL (`?search=SF&minCapacity=100&page=2`) enables:

- Shareable/bookmarkable search results
- Browser back/forward navigation works
- Server-side rendering with filters

**Tradeoff:** More complex state management than local state.

### 4. Slug-Based URLs

**Why:** `/venues/grand-ballroom-san-francisco` is more readable and SEO-friendly than `/venues/1`.

**Tradeoff:** Requires unique slug generation and lookup by slug instead of ID.

### 5. Price Locking at Inquiry Time

**Why:** `quotedPricePerNight` captures the price when the booking is created. If venue prices change later, the original quote is preserved.

**Tradeoff:** Extra column, but prevents pricing disputes.

## Next Improvement

| Improvement                      | Reason                                          |
| -------------------------------- | ----------------------------------------------- |
| Integration tests for API routes | Test full HTTP flow, not just services          |
| E2E tests with Playwright        | Verify user flows work end-to-end               |
| Rate limiting middleware         | Prevent API abuse                               |
| Email notifications              | Confirm booking receipt to users                |
| DB-level EXCLUDE constraint      | Bulletproof overlap prevention if auto-confirm  |
| Redis caching                    | Cache venue listings for high-traffic scenarios |
| Third-party hotel sync           | Webhook handlers for real-time availability     |

## Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI)
npm run test:run
```

**Current Coverage:**

- `venue.service.test.ts` - Venue listing, filtering, 404 handling
- `booking.service.test.ts` - Booking creation, capacity validation, overlap detection

**Testing Pattern:**

```typescript
// Services tested with mocked repositories
vi.mock("@/repositories/venue.repository");
vi.mocked(venueRepository.findMany).mockResolvedValue({ venues: [...], total: 2 });
```
