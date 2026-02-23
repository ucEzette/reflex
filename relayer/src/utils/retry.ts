export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        baseDelayMs?: number;
        maxDelayMs?: number;
        onRetry?: (error: any, attempt: number) => void;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        baseDelayMs = 1000,
        maxDelayMs = 30000,
        onRetry,
    } = options;

    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) break;

            const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
            if (onRetry) onRetry(error, attempt + 1);

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}
