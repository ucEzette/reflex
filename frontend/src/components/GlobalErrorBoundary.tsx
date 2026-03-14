"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home, shield } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isWalletError = this.state.error?.message?.toLowerCase().includes("wallet") || 
                           this.state.error?.message?.toLowerCase().includes("metamask") ||
                           this.state.error?.message?.toLowerCase().includes("connector");

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">
                {isWalletError ? "Wallet Connection Issue" : "System Interruption"}
              </h2>

              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                {isWalletError 
                  ? "We encountered a minor glitch while connecting to your Web3 provider. This often happens if the extension is locked or busy."
                  : "Reflex encountered an unexpected runtime error. Our autonomous monitoring system has been notified."}
              </p>

              {this.state.error && (
                <div className="w-full bg-accent/50 rounded-xl p-4 mb-8 text-left border border-border overflow-hidden">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Error Diagnostic</p>
                  <p className="text-xs font-mono text-red-400 break-all">{this.state.error.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Try Again
                </button>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 bg-accent border border-border text-foreground py-3 rounded-xl font-bold text-sm hover:bg-accent/80 transition-all"
                  onClick={() => this.setState({ hasError: false, error: null })}
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Network Status: Operational
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
