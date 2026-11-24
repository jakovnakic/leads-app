# Leads Management App

A full-stack application for managing commercial leads, assigning them to sales agents, and calculating lead priorities using a configurable weighted scoring system.

## Tech Stack

### Frontend

- React
- JavaScript
- Vite
- Material UI
- SCSS
- React Router
- TanStack Query

### Backend

- Node.js
- Express
- JavaScript (ES Modules)
- PostgreSQL
- node-postgres (`pg`)

### Testing

- Jest
- Supertest

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jakovnakic/leads-app.git
cd leads-app
```

### 2. Database setup

Create a PostgreSQL database for the application.

Navigate to the backend directory and create your environment file:

```bash
cd backend

# Windows (Command Prompt)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Update the environment variables in `.env`:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
```

Run the SQL scripts against your database in the following order:

1. `src/db/schema.sql` – creates the database tables, constraints and indexes.
2. `src/db/seed.sql` – inserts the initial scoring configuration and scoring options.
3. `src/db/sample-data.sql` – inserts sample agents and leads.

These scripts should be executed once against a fresh database.

### 3. Start the backend

From the `backend` directory:

```bash
npm install
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 4. Start the frontend

Open a second terminal window:

```bash
cd frontend

# Windows (Command Prompt)
copy .env.example .env

# macOS / Linux
cp .env.example .env

npm install
npm run dev
```

The frontend development server will display its local URL in the terminal.

## Database Model

The application uses PostgreSQL with six tables:

| Table                         | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `agents`                      | Stores sales agent information.                                 |
| `leads`                       | Stores lead details, status, assignment and scoring attributes. |
| `scoring_config`              | Stores the configurable weights used by the scoring system.     |
| `commercial_interest_options` | Defines commercial interest levels and their ratings.           |
| `lead_source_options`         | Defines lead sources and their ratings.                         |
| `age_scoring_rules`           | Defines scoring ratings based on lead age.                      |

### Lead Statuses

Each lead can have one of four statuses:

- `new`
- `in_progress`
- `contacted`
- `closed`

Leads can be assigned to a sales agent or remain unassigned.

### Data Integrity and Concurrency

- UUIDs are used as primary keys.
- Foreign keys maintain relationships between leads, agents and scoring options.
- Database constraints validate lead statuses, scoring ratings and scoring weights.
- Version columns support optimistic concurrency control when updating leads and scoring configuration.
- Updates are accepted only when the version supplied by the client matches the current database version. Successful updates increment the version. Outdated updates return HTTP `409 Conflict`.

## Lead Scoring Methodology

Each lead receives a score between 0 and 100 based on four criteria. Each criterion produces a rating between 0 and 100, which is multiplied by its configurable weight.

### Initial Weights

| Criterion           | Initial Weight |
| ------------------- | -------------: |
| New customer        |            40% |
| Commercial interest |            30% |
| Lead source         |            20% |
| Age                 |            10% |
| **Total**           |       **100%** |

These are the default weights used when the database is initially seeded. They can be modified through the application's scoring configuration page.

### Rating Rules

**1. New Customer**

- New customer: 100 points.
- Existing customer: 0 points.

**2. Commercial Interest**

Commercial interest is selected from predefined options:

| Option | Rating |
| ------ | -----: |
| High   |    100 |
| Medium |     50 |
| Low    |     20 |

**3. Lead Source**

Each lead source has a predefined rating:

| Source        | Rating |
| ------------- | -----: |
| Referral      |    100 |
| Website       |     90 |
| Social media  |     80 |
| Advertisement |     60 |

**4. Lead Age**

The lead's age is calculated using complete 24-hour periods since its creation.

| Lead Age        | Rating |
| --------------- | -----: |
| 0–2 days        |    100 |
| 3–9 days        |     80 |
| 10–29 days      |     50 |
| 30 days or more |      0 |

The applicable rule is the one with the highest minimum-day threshold that does not exceed the lead's age.

### Score Calculation

The final score is calculated using the following formula:

`Score = Σ (criterion rating × criterion weight / 100)`

The initial weights are 40%, 30%, 20% and 10%, respectively.

### Priority Levels

| Score    | Priority |
| -------- | -------- |
| 75–100   | High     |
| 40–74.99 | Medium   |
| Below 40 | Low      |

### Configuration and Validation

- All weights must be non-negative integers between 0 and 100.
- The sum of all weights must equal exactly 100%.
- Each criterion rating must be between 0 and 100.
- Scoring options and age thresholds are stored in the database rather than hardcoded in the frontend.
- Scores are calculated by the backend. Clients cannot submit arbitrary scores.
- Changes to scoring weights are reflected in subsequent score calculations and score-based sorting.

## API Overview

The backend exposes a REST API under the `/api` prefix.

### Health and Agents

| Method | Endpoint      | Description                              |
| ------ | ------------- | ---------------------------------------- |
| GET    | `/api/health` | Checks server and database connectivity. |
| GET    | `/api/agents` | Retrieves all sales agents.              |

### Leads

| Method | Endpoint         | Description                                                                 |
| ------ | ---------------- | --------------------------------------------------------------------------- |
| GET    | `/api/leads`     | Retrieves leads with filtering, searching, sorting and pagination.          |
| GET    | `/api/leads/:id` | Retrieves an individual lead, including its calculated score and breakdown. |
| POST   | `/api/leads`     | Creates a new lead.                                                         |
| PATCH  | `/api/leads/:id` | Updates lead information and assignment.                                    |

#### GET `/api/leads`

Supported query parameters:

| Parameter | Description                          | Default      |
| --------- | ------------------------------------ | ------------ |
| `status`  | Filter by lead status.               | All statuses |
| `agentId` | Filter by assigned agent UUID.       | All agents   |
| `search`  | Search by lead name or phone number. | None         |
| `sortBy`  | Sort by `created_at` or `score`.     | `created_at` |
| `order`   | Sort direction: `asc` or `desc`.     | `desc`       |
| `page`    | Requested page number.               | `1`          |
| `limit`   | Number of leads per page.            | `20`         |

Example:

```http
GET /api/leads?status=new&sortBy=score&order=desc&page=1&limit=20
```

The response contains a `data` array and pagination metadata, including the current page, page size, total number of results and total number of pages.

#### POST `/api/leads`

Creates a new lead.

Example request body:

```json
{
  "name": "John Smith",
  "phone": "+34 600 123 456",
  "status": "new",
  "assigned_agent_id": null,
  "is_new_customer": true,
  "commercial_interest_option_id": "OPTION_UUID",
  "lead_source_option_id": "SOURCE_UUID"
}
```

The response includes the created lead and its calculated scoring information.

#### PATCH `/api/leads/:id`

Updates one or more lead fields. Only the supplied fields are updated.

Supported fields:

- `name`
- `phone`
- `status`
- `assigned_agent_id`
- `is_new_customer`
- `commercial_interest_option_id`
- `lead_source_option_id`

The request must include the current `version` of the lead.

Example request body:

```json
{
  "status": "in_progress",
  "assigned_agent_id": "AGENT_UUID",
  "version": 1
}
```

To unassign a lead, set `assigned_agent_id` to `null`.

Successful updates increment the lead version and return the updated lead with recalculated scoring information.

### Scoring Configuration

| Method | Endpoint              | Description                                       |
| ------ | --------------------- | ------------------------------------------------- |
| GET    | `/api/scoring-config` | Retrieves scoring weights, options and age rules. |
| PATCH  | `/api/scoring-config` | Updates the scoring weights.                      |

#### PATCH `/api/scoring-config`

All four weights must be provided, and their sum must equal exactly 100.

Example request body:

```json
{
  "new_customer_weight": 35,
  "commercial_interest_weight": 35,
  "lead_source_weight": 20,
  "age_weight": 10,
  "version": 1
}
```

Successful updates increment the configuration version and return the updated scoring configuration.

### Error Responses

The API uses centralized error-handling middleware.

| HTTP Status | Description                                               |
| ----------- | --------------------------------------------------------- |
| 200         | Successful request.                                       |
| 201         | Resource successfully created.                            |
| 400         | Invalid request data or database constraint violation.    |
| 404         | Requested resource not found.                             |
| 409         | Conflict, such as a duplicate record or outdated version. |
| 500         | Unexpected server error.                                  |

## Testing

The backend uses Jest for automated testing and Supertest for API integration tests.

The tests cover:

- Lead scoring calculations and priority levels.
- Invalid scoring data and scoring rules.
- Successful lead creation.
- Validation of missing required lead fields.

Run the backend test suite from the `backend` directory:

```bash
npm test -- --runInBand
```

## Architecture

The application follows a layered architecture to separate HTTP handling, business logic, and database access.

### Backend

- **Routes:** Define API endpoints and connect them to controllers.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain business logic, validation, scoring calculations, and database operations.
- **Database:** PostgreSQL stores application data and scoring configuration. Database access is handled through `node-postgres` (`pg`) using parameterized SQL queries.

### Frontend

The React application is organized into reusable components and pages. React Router handles navigation, TanStack Query manages server state, Material UI provides selected UI components, and SCSS handles styling.

### Lead Scoring

Lead scores are calculated on the backend using the configured weights and criterion ratings. The frontend displays the resulting score, priority, and scoring breakdown. Scores are never accepted from the client as authoritative values.

## Known Limitations and Future Improvements

- **Authentication:** The application uses a simplified development setup rather than a complete authentication and authorization system.
- **Agent identity:** Agent identity is not currently derived from an authenticated user session.
- **Concurrency:** Version-based optimistic locking prevents stale updates from silently overwriting newer changes. Additional transaction and isolation strategies could be considered for more complex concurrent operations.
- **Testing:** Additional integration and end-to-end tests could improve coverage of complete user workflows.
- **Production readiness:** Deployment configuration, logging, monitoring, and security hardening would be required before production use.
