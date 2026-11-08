import {useEffect, useState} from 'react'

export function useErrorMessage(duration = 3000)
{
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if(!message) return;

        const timer = setTimeout(() => setMessage(null), duration);
        return () => clearTimeout(timer);
    }, [message, duration]);

    return [message, setMessage] as const;
}