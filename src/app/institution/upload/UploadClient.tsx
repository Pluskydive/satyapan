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
  const { locale } = useLanguage();
  const isHi = locale === "hi";
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
        processCsvRows(result.data, "sample_admission_batch.csv");
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Official Government Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "मुख्य पृष्ठ" : "Home"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <Link href="/institution" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "संस्थान प्रशासन" : "College Administration"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            {isHi ? "छात्र सूची अपलोड" : "Upload Enrolment CSV"}
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          {isHi ? "मान्यता मानदंड: AICTE APH २०२६-२७" : "Compliance: AICTE APH 2026-27"}
        </div>
      </div>

      {/* 1. Department Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi
                ? "भारत सरकार • तकनीकी शिक्षा नियामक प्राधिकरण • छात्र प्रवेश पंजीकरण"
                : "GOVERNMENT OF INDIA • AICTE • STUDENT ADMISSION INGESTION"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43] mt-1">
            {isHi ? "छात्र प्रवेश सूची अपलोड" : "Upload Student Admission List"}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-3.5 py-1.5 bg-white border border-[#205081] hover:bg-[#F4F6F9] text-[#205081] text-xs font-bold rounded-[2px] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          {isHi ? "मानक CSV टेम्पलेट डाउनलोड करें" : "Download Standard CSV Template"}
        </button>
      </div>

      {/* Step 1: Target Institution Selection */}
      <div className="bg-white border border-[#CBD5E1] p-4 rounded-[2px] space-y-2 shadow-xs">
        <label htmlFor="upload-inst-select" className="text-xs font-bold text-[#205081] uppercase tracking-wider block">
          {isHi ? "चरण १: रिपोर्टिंग संस्थान चुनें" : "Step 1: Select Reporting Institution"}
        </label>
        <select
          id="upload-inst-select"
          aria-label="Select Target Reporting Institution"
          value={selectedInstId}
          onChange={(e) => setSelectedInstId(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#CBD5E1] text-xs font-semibold text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081] cursor-pointer"
        >
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.aicte_code}) - {inst.state} ({isHi ? "स्वीकृत क्षमता" : "Sanctioned Intake"}: {inst.approved_intake})
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Upload Dropzone */}
      <div className="bg-white border border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-[#205081] uppercase tracking-wider block">
            {isHi ? "चरण २: छात्र CSV फाइल चुनें" : "Step 2: Select Student CSV File"}
          </label>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs font-bold text-[#205081] hover:underline cursor-pointer text-left sm:text-right"
          >
            {isHi ? "नमूना सत्यापन बैच लोड करें (५ रिकॉर्ड)" : "Load Sample Verification Batch (5 Records)"}
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
          className="border border-dashed border-[#CBD5E1] hover:border-[#205081] p-6 sm:p-8 text-center bg-[#F4F6F9] hover:bg-[#EAEFF5] transition-colors cursor-pointer rounded-[2px] space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#205081]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
            aria-label="Click to select admission CSV file, or drag and drop file here"
          />
          <div className="text-xs sm:text-sm font-bold text-[#205081]">
            {isHi ? "यहाँ क्लिक करें या CSV फ़ाइल खींचकर लाएं" : "Click to select admission CSV file, or drag and drop file here"}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {isHi ? "AICTE APH मानकों के अनुसार UTF-8 एन्कोडेड CSV (.csv) फ़ाइल आवश्यक" : "UTF-8 encoded CSV (.csv) file required per AICTE APH standards"}
          </div>
          {fileName && (
            <div className="inline-block mt-2 px-3 py-1 bg-white border border-[#205081] text-[#205081] font-mono text-xs font-bold rounded-[2px]">
              {isHi ? "चयनित फ़ाइल: " : "Selected File: "}{fileName}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div role="alert" className="p-3 bg-[#FEF2F2] border-l-4 border-l-[#B42318] border-y border-r border-[#FECDCA] text-xs text-[#B42318] rounded-[2px]">
          <strong>{isHi ? "सत्यापन त्रुटि: " : "Validation Error: "}</strong> {errorMessage}
        </div>
      )}

      {/* Pre-flight inspection & Preview */}
      {validationStats && (
        <div className="bg-white border border-[#CBD5E1] rounded-[2px] p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="pb-3 border-b border-[#CBD5E1] flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-[#205081] uppercase tracking-wider">
              {isHi ? "फ़ाइल सत्यापन सारांश" : "Pre-Ingestion File Summary"}
            </h3>
            <span className="text-xs font-mono text-[#059669] font-bold">
              {isHi ? "प्रारूप सत्यापित" : "RFC-4180 Valid"}
            </span>
          </div>

          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] p-3 divide-y sm:divide-y-0 sm:divide-x divide-[#CBD5E1] grid grid-cols-2 sm:grid-cols-4 text-xs">
            <div className="px-3 py-1">
              <span className="text-[#64748B] text-[10px] font-bold uppercase block">
                {isHi ? "कुल रिकॉर्ड" : "Total Records"}
              </span>
              <span className="text-base font-bold text-[#102A43] font-mono">{validationStats.total}</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[#64748B] text-[10px] font-bold uppercase block">
                {isHi ? "वैध अपार" : "Valid APAAR"}
              </span>
              <span className="text-base font-bold text-[#059669] font-mono">{validationStats.validApaar}</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[#64748B] text-[10px] font-bold uppercase block">
                {isHi ? "अमान्य अपार" : "Invalid APAAR"}
              </span>
              <span className="text-base font-bold text-[#B42318] font-mono">{validationStats.invalidApaar}</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[#64748B] text-[10px] font-bold uppercase block">
                {isHi ? "सुरक्षित फ़ील्ड्स" : "Sanitized Fields"}
              </span>
              <span className="text-base font-bold text-[#102A43] font-mono">{validationStats.sanitizedFormulas}</span>
            </div>
          </div>

          {/* Record table preview */}
          <div className="border border-[#CBD5E1] overflow-x-auto max-h-60 rounded-[2px]">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold sticky top-0">
                <tr>
                  <th scope="col" className="w-12 py-2 px-3 border-r border-[#112D4E] text-center">{isHi ? "क्र." : "Sr."}</th>
                  <th scope="col" className="py-2 px-3 font-mono border-r border-[#112D4E]">{isHi ? "रोल नंबर" : "Student ID"}</th>
                  <th scope="col" className="py-2 px-3 border-r border-[#112D4E]">{isHi ? "छात्र का नाम" : "Full Name"}</th>
                  <th scope="col" className="py-2 px-3 font-mono border-r border-[#112D4E]">{isHi ? "अपार आईडी" : "APAAR ID"}</th>
                  <th scope="col" className="py-2 px-3 border-r border-[#112D4E]">{isHi ? "पाठ्यक्रम" : "Program"}</th>
                  <th scope="col" className="py-2 px-3 text-center">{isHi ? "प्रवेश तिथि" : "Admission Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1] text-[#102A43] font-mono text-[11px]">
                {parsedRows.map((r, i) => (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      i % 2 === 0 ? "bg-white hover:bg-[#EAEFF5]" : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                    }`}
                  >
                    <td className="py-2 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">{i + 1}</td>
                    <td className="py-2 px-3 font-bold text-[#205081] border-r border-[#CBD5E1]">{r.institutional_student_id}</td>
                    <td className="py-2 px-3 font-sans text-xs font-semibold border-r border-[#CBD5E1]">{r.full_name}</td>
                    <td className="py-2 px-3 border-r border-[#CBD5E1]">
                      {isValidApaar(r.apaar_id) ? (
                        <span className="text-[#059669] font-bold">{r.apaar_id}</span>
                      ) : (
                        <span className="text-[#B42318] font-bold bg-[#FEF2F2] px-1 py-0.5 rounded-[2px]">{r.apaar_id || "MISSING"}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-sans text-xs border-r border-[#CBD5E1]">{r.program}</td>
                    <td className="py-2 px-3 text-center text-[#64748B]">{r.admission_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isUploading}
            className="w-full py-2.5 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isUploading
              ? (isHi ? "सत्यापन एवं पंजीकरण प्रक्रिया जारी है…" : "Processing & Validating Records...")
              : (isHi ? `रिकॉर्ड सत्यापित करके सहेजें (${parsedRows.length})` : `Commit & Ingest Records (${parsedRows.length})`)}
          </button>
        </div>
      )}

      {/* Success notification */}
      {uploadResult && (
        <div role="status" className="bg-[#ECFDF5] border-l-4 border-l-[#059669] p-4 border-y border-r border-[#A7F3D0] rounded-[2px] space-y-3 shadow-xs">
          <div>
            <div className="text-xs font-bold text-[#059669] uppercase">
              {isHi ? "प्रवेश बैच सफलतापूर्वक पंजीकृत किया गया" : "Batch Ingestion Successful"}
            </div>
            <div className="text-xs text-[#334155] mt-1">
              {isHi
                ? `संस्थान के रजिस्टर में कुल ${uploadResult.inserted} छात्रों का पंजीकरण सफलतापूर्वक कर दिया गया है। AICTE केंद्रीय निरीक्षण प्रणाली द्वारा सभी रिकॉर्ड का सत्यापन पूरा हो गया है।`
                : `Successfully ingested ${uploadResult.inserted} student enrolment records into the institution registry. Automated integrity rules have been executed.`}
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <Link
              href="/institution"
              className="text-xs font-bold text-[#205081] hover:underline"
            >
              {isHi ? "→ कॉलेज रजिस्टर देखें" : "→ View College Roster"}
            </Link>
            <span className="text-[#CBD5E1]">|</span>
            <Link
              href="/aicte"
              className="text-xs font-bold text-[#205081] hover:underline"
            >
              {isHi ? "→ राष्ट्रीय नियंत्रण कक्ष" : "→ National Control Tower"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadClient() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#5B6573]">Loading Student Admission Upload...</div>}>
      <UploadContent />
    </Suspense>
  );
}
