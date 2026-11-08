type BreadcrumbsProperties = {
    segments: string[];
    onNavigate: (path: string) => void;
};

export function Breadcrumbs({segments, onNavigate}: BreadcrumbsProperties)
{
    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <button onClick={() => onNavigate("")}>Home</button>
            {segments.map((segment, index) => (
                <span key={index}>
                    {"> "}
                    <button onClick={() => onNavigate(segments.slice(0, index + 1).join("/"))}>{segment}</button>
                </span>
                ))}
        </nav>
    );
}