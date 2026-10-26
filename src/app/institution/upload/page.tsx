"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { sanitizeRecordRow, isValidApaar } from "@/lib/security";

const SAMPLE_CSV_CONTENT = `apaar_id,institutional_student_id,full_name,dob_year,gender,social_category,nationality_type,program,admission_year,admission_date
100000000501,STU-501,Aditi Verma,2005,Female,General,indian,B.Tech CSE,2026,2026-07-15
100000000502,STU-502,Rohan Deshmukh,2004,Male,OBC,indian,B.Tech ECE,2026,2026-07-18
100000000503,STU-503,Kavya Iyer,2005,Female,SC,indian,B.Tech AI-ML,2026,2026-07-20
100000000504,STU-504,Tenzin Dorji,2003,Male,,foreign_national,B.Tech Civil,2026,2026-08-01
99999,STU-505,Arjun Mehta,2005,Male,General,indian,B.Tech Mechanical,2026,2026-11-20`;

function UploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>(
    searchParams.get("instId") || "inst-1001"
  );

  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationStats, setValidationStats] = useState<{
    total: number;
    validApaar: number;
    invalidApaar: number;
    sanitizedFormulas: number;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/institutions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInstitutions(data);
          if (!searchParams.get("instId") && data.length > 0) {
            setSelectedInstId(data[0].id);
          }
        }
      })
      .catch((e) => console.error(e));
  }, [searchParams]);

  const processCsvRows = (rows: any[], name: string) => {
    setFileName(name);
    setUploadResult(null);
    setErrorMessage(null);

    let formulaCount = 0;
    let validApaars = 0;
    let invalidApaars = 0;

    const cleaned = rows.map((r) => {
      // Check for formula injection triggers
      for (const val of Object.values(r)) {
        if (typeof val === "string" && /^[=+\-@\t\r]/.test(val.trim())) {
          formulaCount++;
        }
      }
      const sanitized = sanitizeRecordRow(r);
      if (isValidApaar(sanitized.apaar_id)) {
        validApaars++;
      } else {
        invalidApaars++;
      }
      return sanitized;
    });

    setParsedRows(cleaned);
    setValidationStats({
      total: cleaned.length,
      validApaar: validApaars,
      invalidApaar: invalidApaars,
      sanitizedFormulas: formulaCount,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrorMessage("Please select a standard CSV (.csv) file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          setErrorMessage("The uploaded CSV file is empty.");
          return;
        }
        processCsvRows(result.data, file.name);
      },
      error: (error) => {
        setErrorMessage("CSV parse error: " + error.message);
      },
    });
  };

  const handleLoadSample = () => {
    Papa.parse(SAMPLE_CSV_CONTENT, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        processCsvRows(result.data, "sample_aicte_admission_batch.csv");
      },
    });
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "satyapan_admission_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadSubmit = async () => {
    if (!parsedRows.length || !selectedInstId) return;

    try {
      setIsUploading(true);
      setErrorMessage(null);

      const res = await fetch("/api/students/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution_id: selectedInstId,
          rows: parsedRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit admission records");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/institution"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Institution Seat Ledger</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bulk Admission CSV Ingestion
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Secure, client-side sanitized ingestion pipeline with APAAR syntax validation and formula shielding.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Step 1: Select Target Institution */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          1. Select Target Institution
        </label>
        <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <select
            value={selectedInstId}
            onChange={(e) => setSelectedInstId(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
          >
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id} className="bg-slate-900 text-slate-200">
                {inst.name} ({inst.aicte_code}) — {inst.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Upload or Dropzone */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            2. Ingest Admission Data
          </label>
          <button
            onClick={handleLoadSample}
            type="button"
            className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
          >
            Load Demo Hackathon Batch (5 Rows with Anomalies)
          </button>
        </div>

        {/* Drag and drop box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-8 text-center bg-slate-950/50 hover:bg-slate-900/50 transition-all cursor-pointer space-y-3 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Click or drag & drop student admission CSV</p>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard UTF-8 CSVs up to 10,000 records per upload batch
            </p>
          </div>
          {fileName && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Loaded: {fileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pre-flight Validation Summary */}
      {validationStats && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pre-Flight Cyber & Integrity Inspection</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Total Records</span>
              <span className="text-lg font-black text-white">{validationStats.total}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Valid APAARs</span>
              <span className="text-lg font-black text-emerald-400">{validationStats.validApaar}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Invalid APAARs</span>
              <span className="text-lg font-black text-amber-400">{validationStats.invalidApaar}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Formulas Neutralized</span>
              <span className="text-lg font-black text-indigo-400 font-mono">
                {validationStats.sanitizedFormulas} (CWE-1236 Safe)
              </span>
            </div>
          </div>

          {/* Preview Table */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-56">
            <table className="w-full text-left text-[11px] text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2 px-3">Roll ID</th>
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3">APAAR ID</th>
                  <th className="py-2 px-3">Program</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-mono">{r.institutional_student_id}</td>
                    <td className="py-2 px-3 font-medium text-white">{r.full_name}</td>
                    <td className="py-2 px-3 font-mono">
                      {isValidApaar(r.apaar_id) ? (
                        <span className="text-emerald-400">{r.apaar_id}</span>
                      ) : (
                        <span className="text-rose-400">{r.apaar_id || "EMPTY"}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{r.program}</td>
                    <td className="py-2 px-3">{r.social_category || "—"}</td>
                    <td className="py-2 px-3 font-mono">{r.admission_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Ingestion Button */}
          <div className="pt-2">
            <button
              onClick={handleUploadSubmit}
              disabled={isUploading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-98 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isUploading ? "animate-spin" : ""}`} />
              <span>
                {isUploading
                  ? "Ingesting & Executing Integrity Engine..."
                  : `Ingest ${parsedRows.length} Admission Records`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Success Modal / Banner */}
      {uploadResult && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-4">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">Ingestion Completed Successfully</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {uploadResult.inserted} records synchronized into the admission ledger.
                Autonomous Integrity Checks triggered.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/institution"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
            >
              View Updated Institution Roster
            </Link>
            <Link
              href="/aicte"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Inspect AICTE National Control Tower
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Ingestion Center...</div>}>
      <UploadContent />
    </Suspense>
  );
}
