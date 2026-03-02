"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary] Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
                    <p className="text-sm text-slate-400 max-w-md mb-6">
                        {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
