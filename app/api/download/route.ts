import {NextRequest, NextResponse} from "next/server";
import {readFile} from "@/lib/storage";
import {checkErrorType} from "@/hooks/nextErrors";
import {getSandboxRoot} from "@/lib/session";

// get specific file at /api/download
export async function GET(request: NextRequest)
{
    const filePath = request.nextUrl.searchParams.get("path");
    if(!filePath)
        return NextResponse.json({error: "Invalid request"}, {status: 400});

    try{
        const root = await getSandboxRoot();
        const {name, data} = await readFile(root, filePath);

        return new NextResponse(new Uint8Array(data), {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
                "Content-Length": String(data.length),
                "X-Content-Type-Options": "nosniff",
            }
        });
    } catch(error){
        return checkErrorType(error, "");
    }
}
