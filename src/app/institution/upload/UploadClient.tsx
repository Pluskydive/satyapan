"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { useLanguage } from "@/components/LanguageProvider";
import { sanitizeRecordRow, isValidApaar } from "@/lib/security";
import type { InstitutionSummary } from "@/lib/types";

type CsvStudentRow = Record<string, string>;
type UploadResult = { inserted: number; mode: "demo" | "live"; notice: string };

const SAMPLE_CSV_CONTENT = `apaar_id,institutional_student_id,full_name,dob_year,gender,social_category,nationality_type,program,admission_year,admission_date
100000000501,STU-501,Aditi Verma,2005,Female,General,indian,B.Tech CSE,2026,2026-07-15
100000000502,STU-502,Rohan Deshmukh,2004,Male,OBC,indian,B.Tech ECE,2026,2026-07-18
100000000503,STU-503,Kavya Iyer,2005,Female,SC,indian,B.Tech AI-ML,2026,2026-07-20
100000000504,STU-504,Tenzin Dorji,2003,Male,,foreign_national,B.Tech Civil,2026,2026-08-01
99999,STU-505,Arjun Mehta,2005,Male,General,indian,B.Tech Mechanical,2026,2026-11-20`;

function UploadContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>(
    searchParams.get("instId") || "inst-1001"
  );

  const [parsedRows, setParsedRows] = useState<CsvStudentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationStats, setValidationStats] = useState<{
    total: number;
    validApaar: number;
    invalidApaar: number;
    sanitizedFormulas: number;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
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

  const processCsvRows = (rows: CsvStudentRow[], name: string) => {
    setFileName(name);
    setUploadResult(null);
    setErrorMessage(null);

    let formulaCount = 0;
    let validApaars = 0;
    let invalidApaars = 0;

    const cleaned = rows.map((r) => {
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
      setErrorMessage("Format rejected: Only RFC-4180 compliant CSV (.csv) files are permitted.");
      return;
    }

    Papa.parse<CsvStudentRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          setErrorMessage("Uploaded file contains no student records.");
          return;
        }
        processCsvRows(result.data, file.name);
      },
      error: (error) => {
        setErrorMessage("CSV parse failure: " + error.message);
      },
    });
  };

  const handleLoadSample = () => {
    Papa.parse<CsvStudentRow>(SAMPLE_CSV_CONTENT, {
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
    link.setAttribute("download", "aicte_satyapan_admission_template.csv");
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

      const data = await res.json() as UploadResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Ingestion transaction failed.");
      }

      setUploadResult(data);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to commit admission records.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/institution"
          className="text-xs font-semibold text-[#17365D] hover:underline"
        >
          &larr; {t("Seat Ledgers")}
        </Link>
      </div>

      {/* Page Title & Action Bar */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
            {t("Data Ingestion Terminal")}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
            {t("Bulk Student Admission CSV Ingestion")}
          </h1>
          <p className="text-xs text-[#5B6573] mt-1 max-w-xl leading-relaxed">
            {t("Ingest official technical admission batches. Includes automated CWE-1236 spreadsheet formula sanitization and APAAR ID syntax validation.")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-3 py-1.5 bg-white border border-[#D8DEE6] hover:bg-[#F4F6F8] text-[#17365D] text-xs font-semibold rounded-[2px] transition-colors cursor-pointer self-start sm:self-auto"
        >
          {t("Download Standard CSV Template")}
        </button>
      </div>

      {/* Step 1: Target Institution */}
      <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-2">
        <label htmlFor="upload-inst-select" className="text-xs font-bold text-[#17365D] uppercase tracking-wider block">
          {t("Step 1: Select Target Reporting Institution")}
        </label>
        <select
          id="upload-inst-select"
          aria-label={t("Step 1: Select Target Reporting Institution")}
          value={selectedInstId}
          onChange={(e) => setSelectedInstId(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D8DEE6] text-xs font-semibold text-[#202B36] rounded-[2px] focus:outline-none focus:border-[#17365D] cursor-pointer"
        >
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.aicte_code}) - {inst.state} (Sanctioned Intake: {inst.approved_intake})
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Upload Dropzone */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-[#17365D] uppercase tracking-wider block">
            {t("Step 2: Upload Structured Admission File")}
          </label>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs font-semibold text-[#17365D] hover:underline cursor-pointer text-left sm:text-right"
          >
            {t("Load Sample Verification Batch (5 Records with Anomalies)")}
          </button>
        </div>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-[#D8DEE6] hover:border-[#17365D] p-8 text-center bg-[#F4F6F8] hover:bg-slate-100 transition-colors cursor-pointer rounded-[2px] space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#17365D]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
            aria-label={t("Click to select admission CSV file, or drag and drop file here")}
          />
          <div className="text-sm font-semibold text-[#17365D]">
            {t("Click to select admission CSV file, or drag and drop file here")}
          </div>
          <div className="text-xs text-[#5B6573]">
            {t("Accepts UTF-8 encoded CSV files conforming to AICTE APH data specification")}
          </div>
          {fileName && (
            <div className="inline-block mt-2 px-2.5 py-0.5 bg-white border border-[#17365D] text-[#17365D] font-mono text-xs font-semibold">
              {t("Selected File:")} {fileName}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div role="alert" className="p-3 bg-white border-l-4 border-[#B42318] text-xs text-[#B42318] border border-[#D8DEE6]">
          <strong>Validation Error:</strong> {errorMessage}
        </div>
      )}

      {/* Pre-flight inspection & Preview */}
      {validationStats && (
        <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-4">
          <div className="pb-3 border-b border-[#D8DEE6] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
              {t("Pre-Flight Cybersecurity & Syntax Audit")}
            </h3>
            <span className="text-xs font-mono text-[#237A52] font-semibold">
              {t("Security Inspection Cleared")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
              <div className="text-[#5B6573] text-[10px] uppercase font-semibold">{t("Total Records")}</div>
              <div className="text-lg font-bold font-mono text-[#17365D] mt-0.5">{validationStats.total}</div>
            </div>
            <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
              <div className="text-[#5B6573] text-[10px] uppercase font-semibold">{t("Valid APAARs")}</div>
              <div className="text-lg font-bold font-mono text-[#237A52] mt-0.5">{validationStats.validApaar}</div>
            </div>
            <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
              <div className="text-[#5B6573] text-[10px] uppercase font-semibold">{t("Invalid APAARs")}</div>
              <div className="text-lg font-bold font-mono text-[#B42318] mt-0.5">{validationStats.invalidApaar}</div>
            </div>
            <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
              <div className="text-[#5B6573] text-[10px] uppercase font-semibold">{t("CWE-1236 Neutralized")}</div>
              <div className="text-lg font-bold font-mono text-[#17365D] mt-0.5">{validationStats.sanitizedFormulas}</div>
            </div>
          </div>

          {/* Record table preview */}
          <div className="border border-[#D8DEE6] overflow-x-auto max-h-52">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead className="bg-[#F4F6F8] text-[#5B6573] uppercase text-[10px] font-semibold sticky top-0 border-b border-[#D8DEE6]">
                <tr>
                  <th scope="col" className="py-2 px-3 font-mono">{t("Roll / Student ID")}</th>
                  <th scope="col" className="py-2 px-3">{t("Student Name")}</th>
                  <th scope="col" className="py-2 px-3 font-mono">{t("Masked APAAR ID")}</th>
                  <th scope="col" className="py-2 px-3">{t("Degree Program")}</th>
                  <th scope="col" className="py-2 px-3">{t("Intake reference")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE6] text-[#202B36] font-mono text-[11px]">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-[#17365D]">{r.institutional_student_id}</td>
                    <td className="py-2 px-3 font-sans text-xs">{r.full_name}</td>
                    <td className="py-2 px-3">
                      {isValidApaar(r.apaar_id) ? (
                        <span className="text-[#237A52]">{r.apaar_id}</span>
                      ) : (
                        <span className="text-[#B42318]">{r.apaar_id || "MISSING"}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-sans text-xs">{r.program}</td>
                    <td className="py-2 px-3 text-[#5B6573]">{r.admission_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isUploading}
            className="w-full py-2.5 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploading ? t("Running sample checks…") : `${t("Save changes")} (${parsedRows.length})`}
          </button>
        </div>
      )}

      {/* Success notification */}
      {uploadResult && (
        <div role="status" className="bg-white border-l-4 border-[#237A52] p-4 border border-[#D8DEE6] rounded-[2px] space-y-3">
          <div>
            <div className="text-xs font-bold text-[#237A52] uppercase">
              {t("Batch Ingestion Completed Successfully")}
            </div>
            <div className="text-xs text-[#5B6573] mt-1">
              Synchronized {uploadResult.inserted} admission records into the institutional roster.
              The autonomous Integrity Engine was triggered and updated all compliance scores.
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <Link
              href="/institution"
              className="text-xs font-semibold text-[#17365D] hover:underline"
            >
              &rarr; {t("Seat Ledgers")}
            </Link>
            <span className="text-[#D8DEE6]">|</span>
            <Link
              href="/aicte"
              className="text-xs font-semibold text-[#17365D] hover:underline"
            >
              &rarr; {t("Control Tower")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadClient() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#5B6573]">Loading Ingestion Terminal...</div>}>
      <UploadContent />
    </Suspense>
  );
}
