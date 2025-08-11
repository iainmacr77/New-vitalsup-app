import { FileText, ArrowLeft, Beaker } from "lucide-react"
import Link from "next/link"

export default function ArticlesPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FileText className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 h-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            />
          </div>
        </div>
      </header>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Article Feed</h1>
        <p className="text-muted-foreground mt-1">Browse and select articles for your newsletters</p>
      </div>

      <div className="flex items-center justify-center py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center max-w-md">
          <div className="h-16 w-16 text-blue-600 mb-6 mx-auto">
            <FileText className="h-full w-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Feed - Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            We're building a curated feed of medical articles for you to select and include in your newsletters.
          </p>
          <div className="space-y-3">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="text-sm text-gray-500">
              or try our{" "}
              <Link 
                href="/dashboard/content-lab" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Content Lab
              </Link>{" "}
              for article processing
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
