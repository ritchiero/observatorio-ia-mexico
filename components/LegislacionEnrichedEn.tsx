'use client';

import LegislacionEnriched, { type LegislacionProps } from './LegislacionEnriched';

export default function LegislacionEnrichedEn(props: LegislacionProps) {
  return <LegislacionEnriched {...props} locale="en" />;
}
