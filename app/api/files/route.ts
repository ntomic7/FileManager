import {NextRequest, NextResponse} from "next/server";
import {createFolder, listDirectory, deleteEntry, renameEntry} from "@/lib/storage";
import {checkErrorType} from "@/hooks/nextErrors";
import {getSandboxRoot} from "@/lib/session";

// get all files at /api/files
export async function GET(request: NextRequest)
{
    const dirPath = request.nextUrl.searchParams.get("path") ?? "";

    try{
        const root = await getSandboxRoot();
        const entries = await listDirectory(root, dirPath);
        return NextResponse.json({path: dirPath, entries});
    }catch(error){
        return checkErrorType(error, "Folder");
    }
}

// upload folders at /api/files
export async function POST(request: NextRequest)
{
    const body = await request.json().catch(() => null);
    if (typeof body?.path !== "string" || typeof body?.name !== "string") {
        return NextResponse.json({error: "Invalid request"}, {status: 400});
    }
    try{
        const root = await getSandboxRoot();
        await createFolder(root, body.path, body.name);
        return NextResponse.json({ok: true}, {status: 201})
    } catch(error){
        return checkErrorType(error, "Folder");
    }
}

export async function DELETE(request: NextRequest)
{
    const targetPath = request.nextUrl.searchParams.get("path");

    if(!targetPath)
        return NextResponse.json({error: "Invalid request"}, {status: 400});

    try{
        const root = await getSandboxRoot();
        await deleteEntry(root, targetPath);
        return NextResponse.json({ok: true});
    } catch (error){
        return checkErrorType(error, "");
    }
}

export async function PATCH(request: NextRequest)
{
    const body = await request.json().catch(() => null);

    if(typeof body?.path !== "string" || typeof body?.name !== "string")
        return NextResponse.json({error: "Invalid quest"}, {status: 400});

    try{
        const root = await getSandboxRoot();
        await renameEntry(root, body.path, body.name);
        return NextResponse.json({ok: true});
    }catch (error){
        return checkErrorType(error, "");
    }
}