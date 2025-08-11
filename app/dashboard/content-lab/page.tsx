"use client"

import { useState, useEffect } from "react"
import { Search, Dna, Calendar, Share2, Bookmark, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

// Interface for the article data structure
interface Article {
  id: string
  headline: string
  summary: string
  category: string
  source_url: string
  tags: string[]
  created_at: string
}

// Interface for Unpaywall result
interface UnpaywallResult {
  doi: string | null
  is_oa: boolean
  oa_status: string | null
  open_url: string | null
  open_pdf_url: string | null
  license: string | null
  title: string | null
  year: number | null
  journal: string | null
  source: "unpaywall"
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "most-saved", label: "Most Saved" },
  { value: "most-shared", label: "Most Shared" },
]

export default function ContentLab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("newest")
  const [allArticles, setAllArticles] = useState<Article[]>([]) // Holds the original full list
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]) // Holds the displayed list
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(["All Categories"])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [activeTab, setActiveTab] = useState("articles")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [articleUrl, setArticleUrl] = useState("")
  const [statusMessage, setStatusMessage] = useState("Enter a URL or DOI above to begin searching for open-access versions")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<UnpaywallResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedDOI, setCopiedDOI] = useState<string | null>(null)

  // Function to fetch ALL articles with their joins
  const fetchAllArticles = async (): Promise<Article[]> => {
    try {
      const { data: entries, error: entryError } = await supabase
        .from('content_lab_entries')
        .select(`
          id,
          generated_headline,
          generated_summary,
          created_at,
          categories (name),
          discovered_articles (source_url),
          content_lab_entry_tags (
            tags (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (entryError) {
        console.error("Error fetching articles:", entryError);
        return [];
      }

      // Map the raw data to our clean Article interface
      const articles = entries.map((entry: any) => ({
        id: entry.id,
        headline: entry.generated_headline,
        summary: entry.generated_summary,
        category: entry.categories.name,
        source_url: entry.discovered_articles.source_url,
        tags: entry.content_lab_entry_tags.map((tag_entry: any) => tag_entry.tags.name),
        created_at: entry.created_at,
      }));

      return articles;
    } catch (error) {
      console.error("Error in fetchAllArticles:", error);
      return [];
    }
  };

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const { data, error } = await supabase.from('categories').select('name').order('name');
        if (error) throw error;
        if (data) {
          const categoryNames = data.map((category: any) => category.name);
          setCategories(["All Categories", ...categoryNames]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all articles on initial component mount
  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      const fetchedArticles = await fetchAllArticles();
      setAllArticles(fetchedArticles);
      setFilteredArticles(fetchedArticles); // Initially, filtered is the same as all
      setIsLoading(false);
    };
    loadArticles();
  }, []);

  // Effect for filtering and sorting articles
  useEffect(() => {
    let articlesToFilter = [...allArticles];

    // Filter by search query
    if (searchQuery) {
      articlesToFilter = articlesToFilter.filter(
        (article) =>
          article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      articlesToFilter = articlesToFilter.filter((article) => article.category === selectedCategory);
    }

    // Sort articles
    switch (sortBy) {
      case "newest":
      default:
        articlesToFilter.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      // Add other sort cases here if needed, e.g., for 'most-saved'
    }

    setFilteredArticles(articlesToFilter);
  }, [searchQuery, selectedCategory, sortBy, allArticles]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Longevity: "bg-purple-100 text-purple-800 border-purple-200",
      Cardiology: "bg-red-100 text-red-800 border-red-200",
      "Gut Health": "bg-green-100 text-green-800 border-green-200",
      "Women's Health": "bg-pink-100 text-pink-800 border-pink-200",
      "Mental Wellness": "bg-blue-100 text-blue-800 border-blue-200",
      Nutrition: "bg-orange-100 text-orange-800 border-orange-200",
      "Preventive Medicine": "bg-teal-100 text-teal-800 border-teal-200",
      Oncology: "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Clinical Updates": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Family Health": "bg-rose-100 text-rose-800 border-rose-200",
      "Infectious Disease": "bg-lime-100 text-lime-800 border-lime-200",
      "Medical Tech & AI": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Mind & Brain": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const toggleCardExpansion = (articleId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  // Helper function to sanitize title by stripping HTML tags and entities
  const sanitizeTitle = (title: string | null): string => {
    if (!title) return "Article"
    
    // Remove HTML tags like <i>, <sub>, etc.
    const withoutTags = title.replace(/<[^>]*>/g, '')
    
    // Decode common HTML entities
    const decoded = withoutTags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
    
    return decoded.trim() || "Article"
  }

  // Helper function to copy DOI to clipboard
  const copyDOI = async (doi: string) => {
    try {
      await navigator.clipboard.writeText(doi)
      setCopiedDOI(doi)
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedDOI(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy DOI:', err)
    }
  }

  // Helper function to get OA status badge styling
  const getOAStatusBadgeStyle = (oaStatus: string | null): string => {
    if (!oaStatus) return "bg-gray-100 text-gray-800 border-gray-200"
    
    if (oaStatus === 'closed') {
      return "bg-gray-100 text-gray-800 border-gray-200"
    }
    
    // For gold, green, bronze - use success styling
    if (['gold', 'green', 'bronze'].includes(oaStatus.toLowerCase())) {
      return "bg-green-100 text-green-800 border-green-200"
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleProcessArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous results and errors
    setError(null)
    setResult(null)
    
    if (!articleUrl.trim()) {
      setError("Please enter a URL or DOI")
      return
    }

    setIsProcessing(true)
    setStatusMessage("Searching...")

    try {
      const response = await fetch('/api/process-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: articleUrl.trim() }),
      })

      console.log('Response status:', response.status)

      if (response.status === 200) {
        const data = await response.json()
        setResult(data)
        setStatusMessage("Done")
      } else {
        // Handle 4xx/5xx errors
        const errorData = await response.json()
        const errorMessage = errorData.error || errorData.message || 'Unknown error occurred'
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Error processing article:', error)
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Clear error when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArticleUrl(e.target.value)
    if (error) {
      setError(null)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">

        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Lab</h1>
        <p className="text-gray-600 mt-1">Discover and share the latest medical research and insights</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="articles"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Articles & Research
          </TabsTrigger>
          <TabsTrigger 
            value="podcasts"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Podcasts
          </TabsTrigger>
          <TabsTrigger 
            value="paywalled"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Paywalled Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {isLoadingCategories ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Loading categories...</span>
                </div>
              ) : (
                categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`${
                      selectedCategory === category
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                    }`}
                  >
                    {category}
                  </Button>
                ))
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Sort by:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white">
                    {sortOptions.find((option) => option.value === sortBy)?.label}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading articles...</span>
            </div>
          )}

          {!isLoading && filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="h-24 w-24 text-gray-300 mb-4">
                <Search className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters to find what you're looking for.</p>
            </div>
          )}

          {!isLoading && filteredArticles.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-white hover:shadow-md transition-shadow duration-200 border border-gray-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <Badge variant="outline" className={`${getCategoryColor(article.category)} font-medium`}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500 gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.created_at)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">{article.headline}</h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <p className={`text-gray-600 leading-relaxed ${expandedCards.has(article.id) ? '' : 'line-clamp-3'}`}>
                        {article.summary}
                      </p>
                      {article.summary.length > 150 && (
                        <button
                          onClick={() => toggleCardExpansion(article.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 focus:outline-none"
                        >
                          {expandedCards.has(article.id) ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Bookmark className="h-4 w-4" />
                          0
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          0
                        </div>
                      </div>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.open(article.source_url, '_blank')}
                      >
                        Source Article
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="podcasts" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="h-24 w-24 text-gray-300 mb-6">
              <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Podcast Content Lab - Coming Soon</h2>
            <p className="text-gray-600 w-full">
              We're working on bringing you curated medical podcasts and audio content. 
              Stay tuned for updates!
            </p>
          </div>
        </TabsContent>

        <TabsContent value="paywalled" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="h-16 w-16 text-blue-600 mb-4">
                <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Process a Paywalled Article</h2>
              <p className="text-gray-600">
                Paste a URL or DOI to find open-access versions of paywalled articles
              </p>
            </div>

            <form onSubmit={handleProcessArticle} className="space-y-6 w-full">
              <div>
                <label htmlFor="article-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Article URL or DOI
                </label>
                <Input
                  id="article-url"
                  type="text"
                  value={articleUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/article or 10.1234/example.doi"
                  className={`w-full h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  disabled={isProcessing}
                  aria-describedby={error ? "article-url-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Tip: paste a DOI (e.g., 10.7554/eLife.80347) or a URL that contains one (e.g., https://doi.org/10.1126/science.169.3946.635).
                </p>
                {error && (
                  <div 
                    id="article-url-error"
                    className="mt-2 text-sm text-red-600"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isProcessing || !articleUrl.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={isProcessing}
                onClick={(e) => {
                  if (isProcessing) {
                    e.preventDefault()
                    return
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  "Find Open-Access Version"
                )}
              </Button>
            </form>

            <div className="mt-8 w-full space-y-4">
              <div className={`rounded-lg p-4 border ${
                isProcessing 
                  ? "bg-blue-50 border-blue-200" 
                  : error 
                    ? "bg-red-50 border-red-200" 
                    : result?.is_oa
                      ? "bg-green-50 border-green-200"
                      : result
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
              }`}>
                <p className={`text-center ${
                  isProcessing 
                    ? "text-blue-600" 
                    : error 
                      ? "text-red-600" 
                      : result?.is_oa
                        ? "text-green-600"
                        : result
                          ? "text-yellow-600"
                          : "text-gray-600"
                }`}>
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {statusMessage}
                </p>
              </div>

              {!result && !error && !isProcessing && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <div className="h-12 w-12 text-gray-300 mb-4">
                    <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Search</h3>
                  <p className="text-gray-600 w-full">
                    Enter a DOI or URL above to find open-access versions of paywalled articles. 
                    We'll search through multiple sources to help you access the research you need.
                  </p>
                </div>
              )}

              {result && result.is_oa === true && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Open Access Found
                    </Badge>
                    {result.oa_status && (
                      <Badge variant="outline" className={`text-xs ${getOAStatusBadgeStyle(result.oa_status)}`}>
                        {result.oa_status}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {sanitizeTitle(result.title)}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {result.doi && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">DOI:</span>
                        <a 
                          href={`https://doi.org/${result.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {result.doi}
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyDOI(result.doi!)}
                          disabled={copiedDOI === result.doi}
                          className="h-6 px-2 text-xs"
                        >
                          {copiedDOI === result.doi ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    )}
                    {(result.journal || result.year) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Journal:</span>
                        <span>{result.journal}{result.year ? ` (${result.year})` : ''}</span>
                      </div>
                    )}
                    {result.license && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">License:</span>
                        <span>{result.license}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {result.doi && (
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white font-medium"
                        onClick={() => {
                          const url = `https://doi.org/${result.doi}`
                          window.open(url, '_blank', 'noopener,noreferrer')
                        }}
                      >
                        Open Access
                      </Button>
                    )}
                    {result.open_pdf_url && (
                      <Button 
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => window.open(result.open_pdf_url!, '_blank', 'noopener,noreferrer')}
                      >
                        Direct PDF
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {result && result.is_oa === false && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                      No Open Access
                    </Badge>
                    {result.oa_status && (
                      <Badge variant="outline" className={`text-xs ${getOAStatusBadgeStyle(result.oa_status)}`}>
                        {result.oa_status}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    No open-access version found via Unpaywall.
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    {result.doi && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Known DOI:</span>
                        <a 
                          href={`https://doi.org/${result.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {result.doi}
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyDOI(result.doi!)}
                          disabled={copiedDOI === result.doi}
                          className="h-6 px-2 text-xs"
                        >
                          {copiedDOI === result.doi ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    )}
                    {result.title && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Title:</span>
                        <span>{sanitizeTitle(result.title)}</span>
                      </div>
                    )}
                    {(result.journal || result.year) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Journal:</span>
                        <span>{result.journal}{result.year ? ` (${result.year})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}