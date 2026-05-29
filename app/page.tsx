import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustedBy } from "@/components/landing/trusted-by";
import { FeaturesSection } from "@/components/landing/features-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { FinalCta } from "@/components/landing/final-cta";
import Image from "next/image";

function PromoImageSection() {
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
        <Image
          src="/images/civix-promo.png"
          alt="CIVIX AI-powered construction document and permit package review platform"
          width={1920}
          height={1080}
          priority
          className="h-auto w-full object-cover"
        />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <HeroSection />
      <PromoImageSection />
      <TrustedBy />
      <FeaturesSection />
      <WorkflowSection />
      <FinalCta />
    </main>
  );
}