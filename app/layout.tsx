import type {Metadata} from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
    title: "FileManager",
    description: "A small web file manager built with Next.js and TypeScript"
};

export default function RootLayout({children,}:{children: React.ReactNode;})
{
    return (<html lang="en"><body>{children}</body></html>);
}