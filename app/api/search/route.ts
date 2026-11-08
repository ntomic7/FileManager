import {NextRequest, NextResponse} from "next/server";
import {searchEntries, SEARCH_LIMIT} from "@/lib/storage";
import {getSandboxRoot} from "@/lib/session";

// search through entire list at /api/search
export async function GET(request: NextRequest)
{
    const query = request.nextUrl.searchParams.get("q") ?? "";

    if(query.trim() === "" || query.length > 100)
        return NextResponse.json({error: "Invalid search"}, {status: 400});

    try{const root = await getSandboxRoot();
        const results = await searchEntries(root, query);
        return NextResponse.json({results, truncated: results.length >= SEARCH_LIMIT});
    } catch{
        return NextResponse.json({error: "Search failed"}, {status: 500});
    }
}