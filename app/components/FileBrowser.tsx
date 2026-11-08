"use client"

import {useState} from "react";
import {useFolder} from "@/hooks/useFolder";
import {useErrorMessage} from "@/hooks/useErrorMessage";
import {useGlobalSearch} from "@/hooks/useGlobalSearch";

import {Breadcrumbs} from "./Breadcrumbs";
import {FileList} from "./FileList";
import {Modal} from "./Modal";
import {NewFolderForm} from "./NewFolderForm";
import {UploadButton} from "./UploadButton";
import {DropZone} from "./DropZone";
import {PreviewModal} from "./PreviewModal";
import {SearchBox} from "./SearchBox";
import {SearchResults} from "./SearchResults";
import {ConfirmDialog} from "./ConfirmDialog";

import {getPreviewType} from "@/lib/previewTypes";
import {joinPath, downloadUrlFor, previewUrlFor} from "@/lib/paths";
import {requestDelete, requestRename, uploadFiles} from "@/lib/api";

export function FileBrowser()
{
    const [currentPath, setCurrentPath] = useState("");
    const [previewPath, setPreviewPath] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [notice, setNotice] = useErrorMessage(4000);
    const [searchAll, setSearchAll] = useState(false);

    const {entries, error, reload, isLoading} = useFolder(currentPath);

    const normalizedQuery = query.trim().toLowerCase();
    const isGlobalSearch = searchAll && normalizedQuery !== "";
    const search = useGlobalSearch(query, isGlobalSearch, setNotice);

    const visibleEntries = normalizedQuery === "" ? entries :
        entries.filter((entry) => entry.name.toLowerCase().includes(normalizedQuery));
    const segments = currentPath ? currentPath.split("/") : [];

    function goTo(path: string){
        setCurrentPath(path);
        setQuery("");
    }
    function openFolder(name: string){
        goTo(joinPath(currentPath, name));
    }
    function openFromSearch(path: string){
        if(getPreviewType(path)) setPreviewPath(path);
        else window.location.href = downloadUrlFor(path);
    }

    async function confirmDelete(){
        if (fileToDelete === null) return;

        const name = fileToDelete;
        setFileToDelete(null);

        const message = await requestDelete(joinPath(currentPath, name));
        if(message) setNotice(message);
        else reload();
    }
    async function handleRename(name: string, newName: string): Promise<boolean>
    {
        const message = await requestRename(joinPath(currentPath, name), newName);
        if(message){
            setNotice(message);
            return false;
        }
        reload();
        return true;
    }
    async function handleDrop(files: File[]){
        const errors = await uploadFiles(currentPath, files);
        if(errors.length > 0) setNotice(errors.join(" . "));
        reload();
    }

    function renderContent(){
        if(isGlobalSearch){
            if(!search.current)
                return <p className="empty">Searching...</p>;

            return (<SearchResults items={search.current.items}
                        truncated={search.current.truncated}
                        onGo={goTo} onOpenFile={openFromSearch} />);
        }
        if(isLoading && entries.length === 0)
            return <p className="empty loading">Loading..</p>;

        if(error)
            return <p className="error">{error}</p>;
        if(normalizedQuery !== "" && visibleEntries.length === 0)
            return <p className="empty">No matches for "{query.trim()}"</p>;

        return(
            <div className={isLoading ? "is-loading" : undefined}>
                <FileList entries={visibleEntries} onOpenFolder={openFolder}
                      onDelete={setFileToDelete} onRename={handleRename}
                      onPreview={(name) => setPreviewPath(joinPath(currentPath, name))}
                      getDownloadUrl={(name => downloadUrlFor(joinPath(currentPath, name)))}/>
            </div>
        )
    }

    return(
        <div>
            <SearchBox value={query} onChange={setQuery}
                allFolders={searchAll} onAllFoldersChange={setSearchAll}/>
            {notice && <p className="notice">{notice}</p>}
            {fileToDelete !== null && (<ConfirmDialog title="Delete"
                message={`Delete "${fileToDelete}"? This cannot be undone.`}
                onConfirm={confirmDelete} onCancel={() => setFileToDelete(null)} />)}
            <Breadcrumbs segments={segments} onNavigate={goTo} />
            <div className="toolbar">
                <button className="primary-button"
                    onClick={() => setShowNewFolder(true)}>New folder</button>
                <UploadButton currentPath={currentPath} onUploaded={reload} onError={setNotice}/>
            </div>
            <DropZone onFiles={handleDrop}>
                {renderContent()}
            </DropZone>

            {previewPath && (<PreviewModal name={previewPath.split("/").pop() ?? previewPath}
                previewUrl={previewUrlFor(previewPath)} downloadUrl={downloadUrlFor(previewPath)}
                onClose={() => setPreviewPath(null)} />)}
            {showNewFolder && (
                <Modal title="New folder" narrow onClose={() => setShowNewFolder(false)}>
                    <NewFolderForm currentPath={currentPath} onCreated={() => {
                            setShowNewFolder(false); reload();}}/>
                </Modal>)}
        </div>
    )
}