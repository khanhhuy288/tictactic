'use client';

import type { ReplayStep } from '@/lib/ai/thinking';

interface ReplayCaptionProps {
  currentStep: ReplayStep | null;
  stepIndex: number;
  totalSteps: number;
  gridSize: number;
}

function getOutcomeDescription(outcome?: 'win' | 'loss' | 'tie' | 'unknown'): string {
  if (outcome === 'win') return 'Winning position';
  if (outcome === 'loss') return 'Losing position';
  if (outcome === 'tie') return 'Draw position';
  return 'Unknown outcome';
}

function formatCellNumber(moveIndex: number): string {
  // Convert 0-based index to 1-based cell number
  return `Cell ${moveIndex + 1}`;
}

export default function ReplayCaption({ 
  currentStep, 
  stepIndex, 
  totalSteps,
  gridSize,
}: ReplayCaptionProps) {
  if (!currentStep) return null;

  const cellNumber = formatCellNumber(currentStep.moveIndex);
  const outcomeDesc = getOutcomeDescription(currentStep.outcome);
  
  let description = '';
  
  if (currentStep.kind === 'chosen') {
    description = `✅ AI chose ${cellNumber}. ${outcomeDesc}`;
    if (currentStep.nodesVisited !== undefined) {
      description += `, explored ${currentStep.nodesVisited.toLocaleString()} nodes`;
    }
    if (currentStep.maxDepth !== undefined) {
      description += `, depth ${currentStep.maxDepth}`;
    }
  } else if (currentStep.kind === 'pruned') {
    description = `✂️ AI briefly considered ${cellNumber}. ${outcomeDesc}`;
    if (currentStep.pruningDepth !== undefined) {
      description += `, pruned at depth ${currentStep.pruningDepth}`;
    } else if (currentStep.nodesVisited !== undefined) {
      description += `, explored ${currentStep.nodesVisited.toLocaleString()} nodes before pruning`;
    }
  } else {
    description = `${currentStep.stepNumber ? `${currentStep.stepNumber}️⃣ ` : ''}AI considered ${cellNumber}. ${outcomeDesc}`;
    if (currentStep.nodesVisited !== undefined) {
      description += `, explored ${currentStep.nodesVisited.toLocaleString()} nodes`;
    }
    if (currentStep.maxDepth !== undefined) {
      description += `, depth ${currentStep.maxDepth}`;
    }
  }

  return (
    <div className="replay-caption">
      <div className="replay-caption-step">
        Step {stepIndex + 1}/{totalSteps}
      </div>
      <div className="replay-caption-text">
        {description}
      </div>
    </div>
  );
}

