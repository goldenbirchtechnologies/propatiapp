import type { RailFacts } from '@/components/onboarding/dossier/Rail';

/**
 * Contract every onboarding step form implements.
 *
 * `onSaved` is fire-and-forget: the wizard re-reads the server snapshot so the
 * pipeline and rail reflect the write. A step must only call it after the API
 * has confirmed the save.
 */
export interface StepProps {
  stepId: string;
  facts: RailFacts;
  onSaved: () => void | Promise<void>;
}
