import {
  ArrowRight,
  FileText,
  BarChart2,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Lease Dynamix
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Empowering real estate agents to negotiate better lease terms with
              AI-powered insights
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/sign-up">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What You Can Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              title="Document Management"
              description="Upload and store lease documents securely in one centralized location"
              Icon={FileText}
            />
            <FeatureCard
              title="Comparative Analysis"
              description="Compare lease terms and rent across different properties"
              Icon={BarChart2}
            />
            <FeatureCard
              title="Trend Analysis"
              description="Track lease history and identify market trends"
              Icon={TrendingUp}
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <BenefitItem
              title="Track Lease Details"
              description="Stay organized with comprehensive lease tracking across your property portfolio"
            />
            <BenefitItem
              title="Negotiation Insights"
              description="Identify key lease terms that need attention during negotiations"
            />
            <BenefitItem
              title="Market Comparison"
              description="Compare lease terms across properties to ensure competitive rates"
            />
            <BenefitItem
              title="AI-Powered Analysis"
              description="Leverage artificial intelligence to uncover valuable insights"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Lease Management?
          </h2>
          <Button asChild size="lg" className="gap-2">
            <Link href="/sign-up">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <Icon className="w-8 h-8 text-blue-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function BenefitItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="rounded-full bg-blue-100 p-2 h-fit">
        <CheckCircle className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
