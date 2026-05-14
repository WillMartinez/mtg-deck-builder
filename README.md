# Deck Brew

A Magic: The Gathering deck builder built with Next.js, TypeScript, Tailwind CSS, and AWS Cognito.

## Tech Stack

- **Next.js 16** — App Router, server and client components
- **TypeScript** — strict mode
- **Tailwind CSS v4**
- **AWS Cognito** — authentication
- **TanStack Query** — data fetching and caching
- **AWS CDK** — infrastructure as code
- **Jest + Testing Library** — unit and component tests

---

## Prerequisites

- Node.js 22+
- An AWS account with credentials configured (`~/.aws/credentials` or environment variables)
- AWS CDK CLI: `npm install -g aws-cdk`

---

## Infrastructure Setup

The app uses AWS Cognito for authentication. You need to deploy the CDK stack once to provision it.

```bash
cd infrastructure
npm install
npx cdk bootstrap   # first time only, sets up CDK in your AWS account
npx cdk deploy
```

After deploying, the stack outputs three values:

```
AuthStack.UserPoolId = us-east-1_xxxxxxxxx
AuthStack.UserPoolClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
AuthStack.Region = us-east-1
```

Copy these into your `.env.local` file (see Local Setup below).

To preview changes before deploying:

```bash
npx cdk diff
```

To tear down the infrastructure:

```bash
npx cdk destroy
```

---

## Local Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

Copy the example file and fill in the values from your CDK deploy output:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_COGNITO_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
```

**3. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login and signup routes
│   └── (protected)/      # Authenticated routes
├── components/
│   ├── auth/             # Login and signup forms
│   ├── deck/             # Deck builder components
│   ├── layout/           # Header and footer
│   └── providers.tsx     # QueryClientProvider setup
├── lib/
│   ├── api/              # Scryfall API client
│   ├── auth/             # Cognito service and auth context
│   └── deck/             # Deck state and logic
└── types/                # Shared TypeScript types

infrastructure/
├── bin/                  # CDK app entry point
└── lib/stacks/           # CDK stack definitions
```

---

## Notes

- Card data is fetched from the [Scryfall API](https://scryfall.com/docs/api) — no API key required.
- `.env.local` is gitignored. Never commit real Cognito credentials.
