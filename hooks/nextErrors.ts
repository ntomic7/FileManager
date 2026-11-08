import {NextResponse} from "next/server";

export function checkErrorType(error: unknown, type: string)
{
    let fileType = type === "Folder" ? "Folder not found" : "File not found";
    fileType = type === "" ? "Not found" : fileType;

    const code = (error as NodeJS.ErrnoException).code;
    if(code === "EEXIST")
        return NextResponse.json({error: "Already exists"}, {status: 409});
    else if(code === "ENOENT")
        return NextResponse.json({error: `${fileType}`}, {status: 404});
    else if(code === "EQUOTA")
        return NextResponse.json({error: "Storage limit reached (100 MB per sandbox"}, {status: 413});
    return NextResponse.json({error: "Invalid name or path"}, {status: 400});
}