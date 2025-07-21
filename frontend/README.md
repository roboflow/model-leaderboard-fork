# Model Leaderboard Frontend

This is a Next.js application built with shadcn/ui components for the Model Leaderboard.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

For example:
```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
```

## Building for Production

```bash
npm run build
```

This will create static files in the `out/` directory that can replace the current static site.

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/ui/` - shadcn/ui components
- `src/lib/` - Utility functions
- `public/` - Static assets 