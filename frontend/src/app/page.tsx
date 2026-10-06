import FlowCanvas from "@/components/FlowCanvas";
import RouteFx from "@/components/route/RouteFx";
import RouteHud from "@/components/route/RouteHud";
import HomeSection from "@/components/sections/HomeSection";
import AboutSection from "@/components/sections/AboutSection";
import SolutionSection from "@/components/sections/SolutionSection";
import ContactSection from "@/components/sections/ContactSection";

/* One continuous page. Each part names its colour in data-flow; FlowCanvas blends between them. */
export default function Page() {
  return (
    <>
      <FlowCanvas />
      <RouteFx />
      <RouteHud />
      <div id="home" data-flow="home" className="scroll-mt-24">
        <HomeSection />
      </div>
      <div id="about" data-flow="about" className="scroll-mt-24 pt-10">
        <AboutSection />
      </div>
      <div id="solution" data-flow="solution" className="scroll-mt-24 pt-10">
        <SolutionSection />
      </div>
      <div id="contact" data-flow="contact" className="scroll-mt-24 pt-10 pb-8">
        <ContactSection />
      </div>
    </>
  );
}
