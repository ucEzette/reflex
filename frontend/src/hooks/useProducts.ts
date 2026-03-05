import { useState, useEffect } from 'react';
import { ALL_MARKETS, MarketDetail } from '@/lib/market-data';

export function useProducts() {
    const [products, setProducts] = useState<MarketDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Simulate a small delay for realistic loading states
        const timer = setTimeout(() => {
            setProducts(ALL_MARKETS);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return { products, isLoading, error };
}
