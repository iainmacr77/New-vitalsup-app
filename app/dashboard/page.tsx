"use client"

import React, { useState, useEffect } from "react";
import { Library, Headphones, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeatureFlags } from "@/components/base44/features";
import LockedCard from "@/components/base44/LockedCard";
import PlanBadge from "@/components/base44/PlanBadge";

export default function DashboardPage() {
  const [features, setFeatures] = useState<any>(null);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-full">
                <div className="bg-white rounded-2xl border-2 p-6 md:p-7 h-full flex flex-col min-h-[360px]">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="mt-6 space-y-3">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Content Lab */}
          <LockedCard
            locked={false}
            icon={Library}
            title="Content Lab"
            description="Browse articles & clinician-ready summaries. Access the latest medical research with AI-powered insights."
            primaryHref="/dashboard/content-lab"
            primaryLabel="Open Content Lab"
          />

          {/* Podcasts */}
          <LockedCard
            locked={!features.content_podcasts}
            icon={Headphones}
            title="Podcasts"
            description="Discover and listen to curated medical podcasts. Stay updated with expert discussions and case studies."
            primaryHref={features.content_podcasts ? "/dashboard/podcasts" : "/dashboard/billing?feature=content_podcasts"}
            primaryLabel={features.content_podcasts ? "Browse Podcasts" : "Unlock Podcasts"}
            secondaryHref={features.content_podcasts ? "/dashboard/podcasts/how-it-works" : undefined}
            secondaryLabel={features.content_podcasts ? "How it works" : undefined}
          />

          {/* Patient Newsletters */}
          <LockedCard
            locked={true}
            icon={Send}
            title="Patient Newsletters"
            description="Create and send personalized newsletters to your patients. Build engagement with automated health content."
            primaryHref="/dashboard/billing?feature=patient_newsletters"
            primaryLabel="Set-up Patient Newsletters"
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
