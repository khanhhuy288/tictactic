import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tic Tactic',
  description: 'Play Tic Tac Toe against an unbeatable AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

