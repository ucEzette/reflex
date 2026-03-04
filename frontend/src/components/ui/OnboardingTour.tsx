"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, X, ShieldCheck, Zap, Globe } from 'lucide-react';

const STEPS = [
    {
        title: "Welcome to Reflex",
        description: "You're looking at the first decentralized Protection Market. Instead of complicated insurance forms, we use Oracles and Code.",
        icon: <Globe className="w-6 h-6 text-primary" />,
    },
    {
        title: "Select a Risk",
        description: "Browse various markets like Flight Delays, Rainfall, or SaaS Outages. Each card shows the exact trigger and potential payout.",
        icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
    },
    {
        title: "Parametric Execution",
        description: "When you buy a policy, our smart contracts escrow the liquidity. If the Oracle verifies the event, you get paid instantly—no adjusters needed.",
        icon: <Zap className="w-6 h-6 text-amber-500" />,
    },
];

export function OnboardingTour() {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('reflex_onboarding_seen');
        if (!hasSeenOnboarding) {
            const timer = setTimeout(() => setShow(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const nextStep = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            close();
        }
    };

    const close = () => {
        setShow(false);
        localStorage.setItem('reflex_onboarding_seen', 'true');
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                    >
                        {/* Progress dots */}
                        <div className="flex gap-1.5 mb-8">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 w-8 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={close}
                            className="absolute top-6 right-6 text-slate-500 hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-6">
                            <div className="p-3 bg-white/5 w-fit rounded-xl border border-white/5">
                                {STEPS[step].icon}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-2">{STEPS[step].title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {STEPS[step].description}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <button
                                    onClick={close}
                                    className="text-xs font-bold text-slate-500 hover:text-foreground uppercase tracking-widest transition-colors"
                                >
                                    Skip Tour
                                </button>

                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all group"
                                >
                                    {step === STEPS.length - 1 ? "Start Browsing" : "Next Step"}
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Background flare */}
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
