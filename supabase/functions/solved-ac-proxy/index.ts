// Follow this file to set up https://supabase.com/docs/guides/functions/getting-started
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SOLVED_AC_API = "https://solved.ac/api/v3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const targetPath = url.searchParams.get("path");

        if (!targetPath) {
            return new Response(
                JSON.stringify({ error: "Missing 'path' parameter" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Build the target URL: solved.ac API + path (which includes query params)
        const targetUrl = `${SOLVED_AC_API}${targetPath}`;

        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "CoTe-Coach/1.0",
                "Accept": "application/json",
            },
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("[solved-ac-proxy] Error:", error);
        return new Response(
            JSON.stringify({ error: "Proxy request failed", details: String(error) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
