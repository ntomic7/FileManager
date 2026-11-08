import {NextRequest, NextResponse} from "next/server";
import {readFile} from "@/lib/storage";
import {getPreviewType} from "@/lib/previewTypes";
import {checkErrorType} from "@/hooks/nextErrors";
import {getSandboxRoot} from "@/lib/session";

// preview specific file at /api/preview
export async function GET(request: NextRequest)
{
    const filePath = request.nextUrl.searchParams.get("path");
    if(!filePath)
        return NextResponse.json({error: "Invalid request"}, {status: 400});

    const contentType = getPreviewType(filePath);
    if(!contentType)
        return NextResponse.json({error: "Preview not supported"}, {status: 415});

    try{
        const root = await getSandboxRoot();
        const {data} = await readFile(root, filePath);

        return new NextResponse(new Uint8Array(data), {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": "inline",
                "Content-Length": String(data.length),
                "X-Content-Type-Options": "nosniff",
            },
        });
    }catch(error){
        return checkErrorType(error, "");
    }
}

