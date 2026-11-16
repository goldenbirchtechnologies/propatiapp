import HeroSection from './_components/hero-section';
import ModulesSection from './_components/modules-section';
import WorkflowSection from './_components/workflow-section';
import PropertiesSection from './_components/properties-section';
import LocationsSection from './_components/locations-section';
import TrustSection from './_components/trust-section';
import AboutSection from './_components/about-section';
import DirectoriesSection from './_components/directories-section';
import CTASection from './_components/cta-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ModulesSection />
      <WorkflowSection />
      <PropertiesSection />
      <LocationsSection />
      <TrustSection />
      <AboutSection />
      <DirectoriesSection />
      <CTASection />
    </>
  );
}
