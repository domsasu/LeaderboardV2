import React from 'react';

type ExperimentGateProps = {
  /** From `usePrototypeExperiment()` (passed down from `App`). */
  experimentId: string;
  /** Variant id(s) that should render `children`. Other variants get nothing. */
  variants: string[];
  children: React.ReactNode;
};

/**
 * Renders `children` only for the listed toolbar experiment variant(s).
 *
 * Use this for **variant-only** UI so a design change for B does not appear in A
 * (and vice versa). Leave markup **outside** this gate when the change should apply
 * to every variant.
 */
export const ExperimentGate: React.FC<ExperimentGateProps> = ({
  experimentId,
  variants,
  children,
}) => {
  if (!variants.includes(experimentId)) return null;
  return <>{children}</>;
};
