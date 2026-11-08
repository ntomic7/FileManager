import {NextRequest, NextResponse} from "next/server";
import {saveFile} from "@/lib/storage";
import {checkErrorType} from "@/hooks/nextErrors";
import {getSandboxRoot} from "@/lib/session";

// upload files at /api/upload
const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest)
{
    const form = await request.formData().catch(() => null);
    const dirPath = form?.get("path");
    const file = form?.get("file");

    if(typeof dirPath !== "string" || !(file instanceof File))
        return NextResponse.json({error: "Invalid request"}, {status: 400});

    if(file.size > MAX_SIZE)
        return NextResponse.json({error: "File too large"}, {status: 413});

    try{
        const root = await getSandboxRoot();
        const data = Buffer.from(await file.arrayBuffer());
        await saveFile(root, dirPath, file.name, data);
        return NextResponse.json({ok: true}, {status: 201});
    }catch (error) {
        return checkErrorType(error, "Folder");
    }
}