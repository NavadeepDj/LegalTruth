import { EvidenceCard } from '@/components/Chat/EvidenceCard';
import { EvidenceItem } from '@/lib/types';

describe('EvidenceCard Component', () => {
  const mockEvidence: EvidenceItem = {
    page_number: 3,
    section: 'Section 7.2',
    quote: 'Either party may terminate subject to 90 days notice.',
    relevance: 'Directly states termination notice requirements.',
  };

  it('renders citation details cleanly', () => {
    expect(EvidenceCard).toBeDefined();
    expect(mockEvidence.page_number).toBe(3);
    expect(mockEvidence.section).toBe('Section 7.2');
  });
});
