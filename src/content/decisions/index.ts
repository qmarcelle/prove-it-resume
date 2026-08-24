import type { DecisionReceipt } from '@/lib/types';

/**
 * Decision Receipts.
 *
 * The design export listed these seven as selectable checkboxes with a "N selected"
 * counter — it collected intent and returned nothing. Here each is a receipt an
 * evaluator can open.
 *
 * Every receipt is currently unanswered. The supplied material contains the questions
 * but none of the reasoning, and fabricating architectural rationale is exactly the
 * failure mode this site argues against. `DecisionReceipt` renders an explicit awaiting
 * state for these; populating `constraint`, `alternatives`, `decision`, `tradeoff`,
 * `evidence`, and `wouldChangeIf` from verified reasoning is the next content pass.
 */
export const DECISION_RECEIPTS: readonly DecisionReceipt[] = [
  { id: 'dr-mcp', question: 'Why MCP instead of another integration surface?' },
  { id: 'dr-state', question: 'Where should agent state live?' },
  {
    id: 'dr-mandatory',
    question: 'When should a tool call be mandatory versus discretionary?',
  },
  {
    id: 'dr-causality',
    question: 'How do you know repository context actually affected a decision?',
  },
  {
    id: 'dr-cicd',
    question: 'How would you introduce one agent into an existing CI/CD workflow?',
  },
  { id: 'dr-kill', question: 'What would make you kill an AI-platform experiment?' },
  { id: 'dr-negative', question: 'What did your experiments fail to prove?' },
] as const;

/** The receipt's shape, shown even when unanswered so the format is inspectable. */
export const RECEIPT_SECTIONS = [
  'CONSTRAINT',
  'ALTERNATIVES CONSIDERED',
  'DECISION',
  'FAILURE MODE / TRADEOFF',
  'EVIDENCE',
  'WHAT WOULD CHANGE THE DECISION NOW',
] as const;
