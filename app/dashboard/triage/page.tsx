"use client"

import { useState, useEffect } from "react"
import { Check, X, Lock, ExternalLink, Edit } from "lucide-react"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type ReviewStatus = "accept" | "paywalled" | "reject"

interface Article {
  id: string
  title: string
  sourceUrl: string
  status: ReviewStatus
  alternativeUrl?: string
}

// The component function starts here
export default function ApprovalPage() {
    console.log("--- COMPONENT IS RENDERING ON SERVER ---");
    console.log("URL from process.env:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("ANON KEY from process.env:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log("---------------------------------");
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [editingAlternativeUrl, setEditingAlternativeUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from("discovered_articles")
          .select("id, original_title, source_url")
          .eq("triage_status", "passed_relevance_check")

        if (error) throw error
        if (!data) {
          setArticles([])
          setLoading(false)
          return
        }
        const mappedArticles: Article[] = data.map((item: any) => ({
          id: item.id,
          title: item.original_title,
          sourceUrl: item.source_url,
          status: "reject",
        }))
        setArticles(mappedArticles)
      } catch (err: any) {
        setError(err.message || "Failed to load articles.")
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const updateArticleStatus = (articleId: string, newStatus: ReviewStatus) => {
    setArticles((prev) =>
      prev.map((article) => (article.id === articleId ? { ...article, status: newStatus } : article)),
    )
    // Hide alternative URL input if status is not accept
    if (newStatus !== "accept") {
      setEditingAlternativeUrl(null)
    }
  }

  const updateAlternativeUrl = (articleId: string, url: string) => {
    setArticles((prev) =>
      prev.map((article) => (article.id === articleId ? { ...article, alternativeUrl: url } : article)),
    )
  }

  const toggleAlternativeUrlEdit = (articleId: string) => {
    setEditingAlternativeUrl(editingAlternativeUrl === articleId ? null : articleId)
  }

  const handleFinalizeReviews = async () => {
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    try {
      // Map front-end statuses to DB enum values for all articles
      const statusMap: Record<ReviewStatus, string> = {
        accept: 'accepted_for_lab',
        paywalled: 'flagged_paywalled',
        reject: 'rejected_by_human',
      }
      
      // Prepare updates with alternative URL handling
      const updates = articles.map((a) => {
        const baseUpdate = { id: a.id, status: statusMap[a.status] }
        
        // For accepted articles with alternative URL, include the new URL
        if (a.status === 'accept' && a.alternativeUrl) {
          return {
            ...baseUpdate,
            alternativeUrl: a.alternativeUrl
          }
        }
        
        return baseUpdate
      })
      
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Failed to finalize reviews.")
      }
      setSubmitSuccess("Reviews finalized successfully!")
      window.location.reload()
    } catch (err: any) {
      setSubmitError(err.message || "Failed to finalize reviews.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-lg text-gray-700">Loading articles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-lg text-red-600">{error}</span>
      </div>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 h-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Triage</h1>
          <p className="text-gray-600 mt-1">Quickly review the articles passed by the AI Triage Officer.</p>
        </div>

        {/* Article Cards */}
        <div className="space-y-1 mb-8">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between gap-6">
                {/* Left Section - Article Information */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 leading-6 mb-3">{article.title}</h3>
                  <button
                    onClick={() => window.open(article.sourceUrl, "_blank")}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    View Source
                  </button>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Accept Button */}
                  <button
                    onClick={() => updateArticleStatus(article.id, "accept")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      article.status === "accept"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    Accept
                  </button>

                  {/* Edit Alternative URL Button - only show when status is accept */}
                  {article.status === "accept" && (
                    <button
                      onClick={() => toggleAlternativeUrlEdit(article.id)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                      title="Edit alternative URL"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}

                  {/* Paywalled Button */}
                  <button
                    onClick={() => updateArticleStatus(article.id, "paywalled")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      article.status === "paywalled"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    Paywalled
                  </button>

                  {/* Reject Button */}
                  <button
                    onClick={() => updateArticleStatus(article.id, "reject")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      article.status === "reject"
                        ? "bg-slate-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <X className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              </div>
              
              {/* Alternative URL Input Field - only show when editing and status is accept */}
              {article.status === "accept" && editingAlternativeUrl === article.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`alternative-url-${article.id}`} className="text-sm font-medium text-gray-700">
                      Alternative URL:
                    </label>
                    <input
                      id={`alternative-url-${article.id}`}
                      type="url"
                      placeholder="https://example.com/alternative-article"
                      value={article.alternativeUrl || ""}
                      onChange={(e) => updateAlternativeUrl(article.id, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This URL will replace the original source URL when the article is accepted.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Finalize Button and Submission Feedback */}
        <div className="text-center">
          <button
            onClick={handleFinalizeReviews}
            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all duration-200 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Finalizing..." : "Finalize Reviews"}
          </button>
          {submitError && <div className="mt-4 text-red-600">{submitError}</div>}
          {submitSuccess && <div className="mt-4 text-green-600">{submitSuccess}</div>}
        </div>
      </div>
    </>
  )
}