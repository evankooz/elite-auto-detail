import Hero        from '@/components/home/Hero';
import Stats        from '@/components/home/Stats';
import Services     from '@/components/home/Services';
import HowItWorks   from '@/components/home/HowItWorks';
import Gallery      from '@/components/home/Gallery';
import Testimonials from '@/components/home/Testimonials';
import CTA          from '@/components/home/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <CTA />
    </>
  );
}
