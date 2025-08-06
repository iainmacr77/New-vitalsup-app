// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3002, https://app.vitalsup.co.za, https://vitalsup.co.za',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface ProcessArticleRequest {
  input: string;
}

interface UnpaywallResponse {
  doi: string;
  is_oa: boolean;
  oa_status: string | null;
  best_oa_location?: {
    url?: string;
    url_for_pdf?: string;
    license?: string;
  };
  journal_name?: string;
  journal?: string;
  title?: string;
  year?: number;
  published_year?: number;
}

interface ProcessArticleResponse {
  doi: string;
  is_oa: boolean;
  oa_status: string | null;
  open_url: string | null;
  open_pdf_url: string | null;
  license: string | null;
  title: string | null;
  year: number | null;
  journal: string | null;
  source: "unpaywall";
}

// DOI regex pattern
const DOI_REGEX = /10\.\d{4,9}\/[-._;()\/:A-Z0-9]+/i;

// Helper function to extract DOI from input
function extractDOI(input: string): string | null {
  const match = input.match(DOI_REGEX);
  return match ? match[0] : null;
}

// Helper function to create JSON response
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// Helper function to create error response
function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}

// Helper function to fetch Unpaywall data
async function fetchUnpaywallData(doi: string, email: string): Promise<UnpaywallResponse> {
  const url = `https://api.unpaywall.org/v2/${doi}?email=${email}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Unpaywall API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Helper function to map Unpaywall response to our format
function mapUnpaywallResponse(response: UnpaywallResponse): ProcessArticleResponse {
  return {
    doi: response.doi,
    is_oa: response.is_oa === true,
    oa_status: response.oa_status || null,
    open_url: response.best_oa_location?.url || null,
    open_pdf_url: response.best_oa_location?.url_for_pdf || null,
    license: response.best_oa_location?.license || null,
    title: response.title || null,
    year: response.year || response.published_year || null,
    journal: response.journal_name || response.journal || null,
    source: "unpaywall" as const,
  };
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        ...corsHeaders,
        "Allow": "POST",
      },
    });
  }

  try {
    // Validate content-type
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return errorResponse("Content-Type must be application/json", 400);
    }

    // Parse request body
    const body: ProcessArticleRequest = await req.json();
    
    if (!body.input || typeof body.input !== "string") {
      return errorResponse("Request body must contain 'input' field with a string value", 400);
    }

    // Extract DOI
    const doi = extractDOI(body.input);
    if (!doi) {
      return errorResponse("No valid DOI found in the input. Please provide a DOI or URL containing a DOI.", 400);
    }

    // Get Unpaywall email from environment
    const unpaywallEmail = Deno.env.get("UNPAYWALL_EMAIL");
    if (!unpaywallEmail) {
      return errorResponse("Unpaywall email not configured", 500);
    }

    // Fetch data from Unpaywall
    const unpaywallData = await fetchUnpaywallData(doi, unpaywallEmail);
    
    // Map response to our format
    const result = mapUnpaywallResponse(unpaywallData);
    
    return jsonResponse(result);

  } catch (error) {
    console.error("Error processing article:", error);
    return errorResponse("Internal server error", 500);
  }
});
