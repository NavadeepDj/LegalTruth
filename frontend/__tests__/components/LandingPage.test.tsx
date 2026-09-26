import { LandingNavbar } from '@/components/Landing/LandingNavbar';
import { HeroSection } from '@/components/Landing/HeroSection';
import { ProblemStorySection } from '@/components/Landing/ProblemStorySection';
import { HowItWorksStorySection } from '@/components/Landing/HowItWorksStorySection';
import { PrivacyByDesignSection } from '@/components/Landing/PrivacyByDesignSection';
import { InteractiveSimulator } from '@/components/Landing/InteractiveSimulator';
import { ComparisonSection } from '@/components/Landing/ComparisonSection';
import { FaqSection } from '@/components/Landing/FaqSection';
import { LandingFooter } from '@/components/Landing/LandingFooter';

describe('Landing Page Components Suite', () => {
  it('defines all story, privacy, simulation, and comparison components', () => {
    expect(LandingNavbar).toBeDefined();
    expect(HeroSection).toBeDefined();
    expect(ProblemStorySection).toBeDefined();
    expect(HowItWorksStorySection).toBeDefined();
    expect(PrivacyByDesignSection).toBeDefined();
    expect(InteractiveSimulator).toBeDefined();
    expect(ComparisonSection).toBeDefined();
    expect(FaqSection).toBeDefined();
    expect(LandingFooter).toBeDefined();
  });
});
