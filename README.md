# TicTactic

TicTactic is a modern Tic-Tac-Toe playground built with Next.js 16, React 19, and TypeScript. It features an unbeatable Minimax AI with optional Alpha Beta pruning and supports 3×3 and 4×4 boards. Its AI Analysis Mode shows how the engine evaluates each move, including scores, explored nodes, and pruning behavior.

## Features

- Unbeatable Minimax AI opponent
- Optional Alpha-Beta pruning for optimized performance
- Support for 3×3 and 4×4 game boards
- AI Analysis Mode showing move evaluations, explored nodes, and pruning statistics
- Real-time thinking visualization

## Live Demo

🌐 **Live URL**: [https://khanhhuy288.github.io/tictactic/](https://khanhhuy288.github.io/tictactic/)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. The deployment workflow:

1. Triggers on every push to the `main` branch
2. Builds the Next.js app as a static export
3. Deploys to GitHub Pages

## Tech Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript
- **AI Algorithm**: Minimax with Alpha-Beta Pruning
