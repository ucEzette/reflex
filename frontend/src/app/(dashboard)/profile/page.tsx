"use client";

import React, { useState } from "react";
import { useAccount, useDisconnect, useReadContract, useBalance } from "wagmi";
import { CONTRACTS, ESCROW_ABI } from "@/lib/contracts";
import Link from "next/link";
import { toast } from "sonner";
import { 
  User, 
  Copy, 
  ExternalLink, 
  Shield, 
  Wallet, 
  Activity, 
  Settings, 
  Bell, 
  Mail, 
  ShieldAlert, 
  LogOut,
  ChevronRight,
  Fingerprint,
  History,
  ShieldCheck
} from "lucide-react";
import { ActivePolicies } from "@/components/profile/ActivePolicies";
import { ClaimHistory } from "@/components/profile/ClaimHistory";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: usdtBalance } = useBalance({ address, token: CONTRACTS.USDT });
  const formattedBalance = usdtBalance ? (Number(usdtBalance.value) / 1e6).toFixed(2) : "0.00";

  const [notifEmail, setNotifEmail] = useState("");

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to terminal clipboard");
    }
  };

  if (!isConnected) {
    return (
      <div className="pt-40 pb-32 px-12 text-center">
        <div className="max-w-md mx-auto bg-[#0A0A0A] p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          <Fingerprint className="w-16 h-16 text-zinc-800 mx-auto mb-8" />
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Authentication Required</h1>
          <p className="text-zinc-500 mb-8">Access to the Identity Center requires an active Web3 handshake.</p>
          <button className="w-full bg-[#D31027] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#A9081E] transition-all">
             Authenticate Identity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <header className="mb-24">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-8 h-1 bg-[#D31027] rounded-full" />
           <span className="text-[10px] font-black text-[#D31027] uppercase tracking-[0.4em]">Identity Verified</span>
        </div>
        <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic">
          Identity <span className="text-[#D31027]">Center</span>
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-20">
        {/* Left: Core Identity */}
        <div className="w-full lg:w-[60%] flex flex-col gap-20">
          {/* Identity Key Card */}
          <div className="bg-[#101216] rounded-[3rem] p-12 border border-white/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Fingerprint className="w-32 h-32" />
            </div>
            
            <div className="flex flex-col gap-8 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D31027] to-[#800020] flex items-center justify-center border border-white/10 shadow-[0_20px_40px_rgba(211,16,39,0.3)]">
                    <User className="w-10 h-10 text-white" />
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest block mb-1">Authenticated Subject</span>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                        {address?.slice(0, 6)}...{address?.slice(-6)}
                    </h2>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={copyAddress}
                  className="flex items-center justify-center gap-3 bg-white/2 hover:bg-white/5 border border-white/5 py-4 rounded-2xl transition-all group/btn"
                >
                  <Copy className="w-4 h-4 text-zinc-600 group-hover/btn:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-white">Copy Key</span>
                </button>
                <a 
                  href={`https://sepolia.arbiscan.io/address/${address}`}
                  target="_blank"
                  className="flex items-center justify-center gap-3 bg-white/2 hover:bg-white/5 border border-white/5 py-4 rounded-2xl transition-all group/btn"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-600 group-hover/btn:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-white">Explorer</span>
                </a>
              </div>
            </div>
          </div>

          {/* Stats HUD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#101216] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#D31027]/30 transition-all duration-500">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-6">Linked Capital</span>
              <span className="mono-data text-4xl text-white font-black italic tracking-tighter uppercase">{formattedBalance}</span>
              <p className="text-[9px] font-black text-[#D31027] uppercase tracking-widest mt-4">USDT_CLEARANCE</p>
            </div>
            
            <div className="bg-[#101216] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#D31027]/30 transition-all duration-500">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-6">Network Health</span>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="mono-data text-xl text-emerald-400 font-black italic tracking-tighter uppercase">Synchronized</span>
              </div>
              <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest mt-6">Arbitrum_Sepolia</p>
            </div>

            <div className="bg-[#101216] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#D31027]/30 transition-all duration-500">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-6">Trust Rating</span>
              <span className="mono-data text-4xl text-zinc-300 font-black italic tracking-tighter uppercase">Prime</span>
              <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest mt-4">Alpha-7 Compliant</p>
            </div>
          </div>

          {/* Active Protection Section */}
          <div className="flex flex-col gap-10">
             <div className="flex items-center gap-4">
                <ShieldCheck className="w-6 h-6 text-[#D31027]" />
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Active Protection</h2>
                <div className="flex-1 h-px bg-white/5" />
             </div>
             <ActivePolicies />
          </div>

          {/* Protocol Ledger Section */}
          <div className="flex flex-col gap-10">
             <div className="flex items-center gap-4">
                <History className="w-6 h-6 text-[#D31027]" />
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Protocol Ledger</h2>
                <div className="flex-1 h-px bg-white/5" />
             </div>
             <ClaimHistory />
          </div>
        </div>

        {/* Right: Settings / Configuration */}
        <div className="w-full lg:w-[40%]">
          <div className="sticky top-40 flex flex-col gap-8">
             <div className="flex items-center gap-4 mb-2">
                <Settings className="w-5 h-5 text-zinc-600" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">System Config</h2>
             </div>

             <div className="bg-[#101216] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                <div className="space-y-10">
                   {/* Notifications */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-zinc-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Terminal Alerts</span>
                         </div>
                         <div className="w-10 h-5 bg-[#D31027] rounded-full relative p-1 cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
                         </div>
                      </div>
                      <div className="relative group">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-[#D31027] transition-colors" />
                         <input 
                           type="email" 
                           placeholder="COMM_LINK_ENCRYPTED_EMAIL"
                           className="w-full bg-white/2 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-mono text-white focus:outline-none focus:border-[#D31027]/40 transition-all placeholder:text-zinc-800"
                           value={notifEmail}
                           onChange={(e) => setNotifEmail(e.target.value)}
                         />
                      </div>
                   </div>

                   {/* Privacy */}
                   <div className="space-y-6 pt-10 border-t border-white/5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-zinc-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Identity Stealth</span>
                         </div>
                         <div className="w-10 h-5 bg-zinc-800 rounded-full relative p-1 cursor-pointer">
                            <div className="w-3 h-3 bg-zinc-600 rounded-full" />
                         </div>
                      </div>
                      <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
                        Enable stealth mode to obfuscate your protocol activity from the public dashboard feeds.
                      </p>
                   </div>

                   {/* Logout */}
                   <button 
                     onClick={() => disconnect()}
                     className="w-full flex items-center justify-center gap-4 bg-[#D31027] hover:bg-[#A9081E] text-white py-5 rounded-2xl transition-all shadow-xl group"
                   >
                     <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Terminate Session</span>
                   </button>
                </div>
             </div>

             {/* Security Advice */}
             <div className="bg-[#D31027]/5 rounded-[2rem] p-8 border border-[#D31027]/20">
                <div className="flex items-start gap-4">
                   <div className="bg-[#D31027] p-2 rounded-xl mt-1">
                      <Shield className="w-4 h-4 text-white" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Protocol Warning</p>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                        Reflex will NEVER request your private keys or seed phrase. Communications are signed purely via on-chain consensus.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
