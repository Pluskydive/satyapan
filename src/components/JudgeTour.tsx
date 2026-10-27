"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Layers,
  Zap,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
} from "lucide-react";

export default function JudgeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      stepNumber: 1,
      badge: "Phase 1: Apex National Command & Radial Health",
      title: "Real-Time Multi-State Enrolment Ledger",
      icon: Layers,
      description:
        "Replaces outdated annual physical audits with a continuous, real-time national admission intelligence dashboard. Features an SVG radial health dial computing the National Integrity Index (0–100), state-by-state intake distribution, and statutory quota validation.",
      keyInnovations: [
        "Live National Integrity Index with dynamic status transitions",
        "Geographic intake tracking across Indian states with 1-click review filtering",
        "Statutory quota enforcement (Domestic, NRI, OCI, Foreign Nationals) against AICTE APH ceilings",
      ],
      actionHref: "/aicte",
      actionText: "Open National Command Tower",
    },
    {
      stepNumber: 2,
      badge: "Phase 2: Live Ghost-Admission Collision Simulator",
      title: "1-Click Cross-State Fraud & Seat Blocking Detection",
      icon: Zap,
      description:
        "Simulates a live multi-state conflict where an APAAR ID is claimed concurrently by an engineering college in Pune, Maharashtra (CAP Round 1) and another in Bengaluru, Karnataka (KEA Quota), locking out genuine merit candidates.",
      keyInnovations: [
        "1-Click live collision simulation directly on the National Dashboard",
        "Conflict dossier detailing overlapping state counseling bodies and timestamp deltas",
        "Automated vacancy reclamation notice under AICTE Approval Process Handbook Clause 12.4",
      ],
      actionHref: "/aicte",
      actionText: "Launch Collision Simulator on Dashboard",
    },
    {
      stepNumber: 3,
      badge: "Phase 3: DPDP Act 2023 Consent Gate & Merkle Seal",
      title: "Privacy-Preserving Cryptographic Degree Verification",
      icon: ShieldCheck,
      description:
        "Implements strict citizen consent gating under the Digital Personal Data Protection Act, 2023. Admissions are cryptographically sealed with SHA-256 Merkle proofs that evaluators and employers can verify mathematically offline in <1ms without contacting the central database.",
      keyInnovations: [
        "Zero-knowledge selective disclosure protecting candidate PII until consent is confirmed",
        "Tamper-proof SHA-256 Merkle leaf digest binding student roll, program, and institution",
        "Interactive offline cryptographic verification chip using browser Web Crypto API",
      ],
      actionHref: "/verify?code=SATYA-2026-TCS",
      actionText: "Test Degree Verification & Offline Seal",
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <>
      {/* Floating Evaluator Trigger Pill */}
      <div className="fixed bottom-5 right-5 z-40 print:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 bg-[#102A43] hover:bg-[#0B1E33] text-white px-3.5 py-2.5 rounded-full border-2 border-[#F59E0B] shadow-xl transition-all hover:scale-105 cursor-pointer group"
          aria-label="Open Smart India Hackathon Judge Pitch Tour"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F59E0B]" />
          </span>
          <Award className="w-4 h-4 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-wide">
            Judge Quick Tour <span className="hidden sm:inline text-slate-300 font-normal">/ निर्णायक पूर्वावलोकन</span>
          </span>
        </button>
      </div>

      {/* Guided Walkthrough Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="judge-tour-title"
        >
          <div className="bg-white border-2 border-[#102A43] rounded-[6px] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#102A43] text-white p-5 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-[#F59E0B] text-[#102A43] text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-[2px]">
                    SIH Grand Finale Evaluation Guide
                  </span>
                  <span className="text-slate-300 text-xs font-mono">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <h2 id="judge-tour-title" className="text-base sm:text-lg font-bold text-white">
                  SATYAPAN Strategic Innovation Pitch
                </h2>
                <p className="text-[11px] text-slate-300">
                  National Student Enrolment Integrity &amp; APAAR Registry Platform
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-[2px] hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Judge Quick Tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Indicators */}
            <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] px-5 py-2.5 flex items-center justify-between text-xs">
              {steps.map((st, idx) => (
                <button
                  key={st.stepNumber}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`flex items-center gap-1.5 py-1 px-2 rounded-[3px] font-semibold text-xs transition-colors cursor-pointer ${
                    currentStep === idx
                      ? "bg-[#17365D] text-white"
                      : "text-[#64748B] hover:text-[#102A43]"
                  }`}
                >
                  <span className="font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-current">
                    {st.stepNumber}
                  </span>
                  <span className="hidden sm:inline">
                    {idx === 0 ? "National Command" : idx === 1 ? "Collision Simulator" : "Merkle Seal"}
                  </span>
                </button>
              ))}
            </div>

            {/* Step Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] rounded-[4px] shrink-0">
                  <StepIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C87524]">
                    {current.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#102A43]">
                    {current.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {current.description}
                  </p>
                </div>
              </div>

              {/* Key Innovation Highlights */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-[4px] space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                  Key Technical Innovations Demonstrated:
                </div>
                <ul className="space-y-1.5 text-xs text-[#334155]">
                  {current.keyInnovations.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Navigation Action */}
              <div className="pt-1">
                <Link
                  href={current.actionHref}
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#17365D] hover:bg-[#102A43] text-white py-2.5 px-4 text-xs font-bold rounded-[3px] transition-colors shadow-xs"
                >
                  <span>{current.actionText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Modal Navigation Footer */}
            <div className="bg-[#F8FAFC] border-t border-[#CBD5E1] p-4 flex items-center justify-between">
              <div className="text-[11px] font-mono text-[#64748B]">
                Team PRAMAANIT • SIH Grand Finale Edition
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="inline-flex items-center gap-1 border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#102A43] hover:bg-slate-100 disabled:opacity-40 rounded-[2px] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1 bg-[#102A43] hover:bg-[#17365D] text-white px-3.5 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Next Innovation</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 bg-[#059669] hover:bg-[#047857] text-white px-3.5 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Finish Tour</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}