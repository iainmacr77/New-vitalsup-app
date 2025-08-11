import React, { useState, useEffect } from "react";
import { Library, Headphones, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeatureFlags } from "../components/features";
import LockedCard from "../components/LockedCard";
import PlanBadge from "../components/PlanBadge";

export default function Dashboard() {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const featureFlags = await getFeatureFlags();
        setFeatures(featureFlags);
      } catch (error) {
        console.error('Failed to load features:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFeatures();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <style jsx>{`
          :root {
            --brand-start: #FF2A8A;
            --brand-end: #3663FF;
            --brand: #7A54F6;
          }
          .brand-gradient {
            background-image: linear-gradient(135deg, var(--brand-start), var(--brand-end));
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl border-2 p-6 md:p-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="space-y-3 pt-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <style jsx>{`
        :root {
          --brand-start: #FF2A8A;
          --brand-end: #3663FF;
          --brand: #7A54F6;
        }
        .brand-gradient {
          background-image: linear-gradient(135deg, var(--brand-start), var(--brand-end));
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="mb-6 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Your medical content hub
            </p>
          </div>
          
          <PlanBadge planLabel={features.planLabel} />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Content Lab */}
          <LockedCard
            icon={Library}
            title="Content Lab"
            description="Browse articles & clinician-ready summaries. Access the latest medical research with AI-powered insights."
            primaryHref="/content"
            primaryLabel="Open Content Lab"
            secondaryHref="/content/unpaywall"
            secondaryLabel="Find free version (DOI/URL)"
          />

          {/* Podcasts */}
          <LockedCard
            locked={!features.content_podcasts}
            icon={Headphones}
            title="Podcasts"
            description="Discover and listen to curated medical podcasts. Stay updated with expert discussions and case studies."
            primaryHref={features.content_podcasts ? "/podcasts" : "/upgrade?feature=content_podcasts"}
            primaryLabel={features.content_podcasts ? "Browse Podcasts" : "Unlock Podcasts"}
            secondaryHref={features.content_podcasts ? "/podcasts/how-it-works" : undefined}
            secondaryLabel={features.content_podcasts ? "How it works" : undefined}
          />

          {/* Patient Newsletters */}
          <LockedCard
            locked={!features.newsletter_builder}
            icon={Send}
            title="Patient Newsletters"
            description="Create and send personalized newsletters to your patients. Build engagement with automated health content."
            primaryHref={features.newsletter_builder ? "/newsletters/new" : "/upgrade?feature=newsletter_builder"}
            primaryLabel={features.newsletter_builder ? "Create Newsletter" : "Start Patient Newsletters"}
            secondaryHref={features.newsletter_builder ? "/metrics" : undefined}
            secondaryLabel={features.newsletter_builder ? "View Metrics" : undefined}
          />
        </div>

        {/* Empty State Hint */}
        <div className="mt-16 text-center">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            More features are coming soon. We're constantly expanding VitalsUp to serve your medical content needs better.
          </p>
        </div>
      </div>
    </div>
  );
}
