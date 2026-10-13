
"use client";
import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface HecRecord {
  id: number;
  cnic: string;
  reference_number: string;
  degree_title: string;
  name_on_degree: string;
  university: string;
  application_id: string;
  pdf_url?: string;
}

export default function HecVerifyPublic() {
  const [cnic, setCnic] = useState("");
  const [refNo, setRefNo] = useState("");
  const [cnicFocused, setCnicFocused] = useState(false);
  const [refFocused, setRefFocused] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [cnicTouched, setCnicTouched] = useState(false);
  const [refTouched, setRefTouched] = useState(false);
  const [refError, setRefError] = useState(false);
  const [cnicError, setCnicError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<HecRecord[]>([]);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const isSearchEnabled = cnic.trim() !== "" && refNo.trim() !== "" && captchaToken !== null;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!cnic.trim() || !refNo.trim()) {
      setCnicTouched(true); setRefTouched(true); setCnicError(!cnic.trim()); setRefError(!refNo.trim());
      setErrorMsg("Please provide valid cnic/passport number and reference number.");
      return;
    }
    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA verification.");
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnic: cnic.replace(/-/g, ""), reference_number: refNo, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok || !data.found || data.records.length === 0) {
        setErrorMsg("No record found for the provided CNIC and reference number.");
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
      } else {
        setResults(data.records);
        setShowResults(true);
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCnic("");
    setRefNo("");
    setCnicFocused(false);
    setRefFocused(false);
    setCnicTouched(false);
    setRefTouched(false);
    setCnicError(false);
    setRefError(false);
    setCaptchaToken(null);
    setShowResults(false);
    setResults([]);
    setErrorMsg(null);
    recaptchaRef.current?.reset();
  };

  const handleClose = () => {
    setShowResults(false);
    setResults([]);
    setErrorMsg(null);
  };

  const handlePrint = (record: HecRecord) => {
    const targetUrl = record.pdf_url || (record.application_id ? `/DAS_approved_letter_${encodeURIComponent(record.application_id)}.pdf?download=true` : null);
    if (!targetUrl) {
      setErrorMsg("The document is not available for download.");
      return;
    }
    const fileName = `DAS_approved_letter_${record.application_id || record.id}.pdf`;
    fetch(targetUrl)
      .then(res => {
        if (!res.ok) throw new Error("Network response error");
        return res.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
      })
      .catch(() => {
        const a = document.createElement("a");
        a.href = targetUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/hec-portal.css?v=6" />

      <div className="hec-public-screen container-fluid" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
        <div className="flex justify-center">
          <div className="w-full xl:w-11/12">

            {/* ── PAGE HEADER ── */}
            <header className="hec-public-header">
              <h1 className="hec-public-title">Degree attestation verification</h1>
              <p className="hec-public-lead">
                Enter your CNIC or passport number and HEC reference number, then complete the verification step to
                view your application.
              </p>
            </header>

            <form className="hec-public-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <section className="hec-panel hec-panel--search" aria-labelledby="hec-search-heading">
                <div className="hec-panel-head">
                  <h2 className="hec-panel-title" id="hec-search-heading">Search</h2>
                </div>
                <div className="hec-panel-body">

                  {/* CNIC + REF NO INPUTS */}
                  {/* FIX: Ensure they take exactly 50% and look joined like the reference */}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 hec-form-grid mb-4">
                    
                    {/* CNIC Field */}
                    <div className="flex-1">
                      <div className={`hec-mat-field${cnicFocused || Boolean(cnic.trim()) ? " is-floating" : ""}`}>
                        <span className={`hec-mat-label required-label${cnicError ? " is-invalid-label" : (cnicTouched && cnic.trim() ? " is-valid-label" : "")}`}>
                          CNIC / Passport number
                        </span>
                        <input
                          type="text"
                          className={`hec-element${cnicError ? " is-invalid" : (cnicTouched && cnic.trim() ? " is-valid" : "")}`}
                          value={cnic}
                          onFocus={() => setCnicFocused(true)}
                          onBlur={() => { setCnicFocused(false); setCnicTouched(true); }}
                          onChange={(e) => { setCnic(e.target.value); if(cnicError && e.target.value.trim()) setCnicError(false); }}
                          maxLength={50}
                          autoComplete="off"
                          placeholder=""
                        />
                        {cnicError ? <span className="hec-mat-error">Required</span> : <span className="hec-mat-hint">CNIC or passport number without dashes</span>}
                      </div>
                    </div>

                    {/* Reference Number Field */}
                    <div className="flex-1">
                      <div className={`hec-mat-field${refFocused || Boolean(refNo.trim()) ? " is-floating" : ""}`}>
                        <span className={`hec-mat-label required-label${refError ? " is-invalid-label" : (refTouched && refNo.trim() ? " is-valid-label" : "")}`}>
                          Reference number
                        </span>
                        <input
                          type="text"
                          className={`hec-element${refError ? " is-invalid" : (refTouched && refNo.trim() ? " is-valid" : "")}`}
                          value={refNo}
                          onFocus={() => setRefFocused(true)}
                          onBlur={() => { setRefFocused(false); setRefTouched(true); }}
                          onChange={(e) => { setRefNo(e.target.value); setRefError(false); }}
                          autoComplete="off"
                          placeholder=""
                        />
                        {refError ? (
                          <span className="hec-mat-error">Required</span>
                        ) : (
                          <span className="hec-mat-hint">As printed on your HEC application or correspondence</span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* CAPTCHA */}
                  <div className="hec-captcha-block">
                    <span className="hec-captcha-label">Verification</span>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LcidOMZAAAAAPvG8m9OP9cjgmzRlkKtDMDBNGIo"}
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                    />
                  </div>

                  {/* TOOLBAR */}
                  <div className="hec-toolbar">
                    <div className="hec-toolbar-primary">
                      <button
                        type="submit"
                        className="hec-btn hec-btn--primary"
                        disabled={!isSearchEnabled || loading || showResults}
                      >
                        {loading ? "Searching..." : "Search"}
                      </button>
                    </div>
                    <div className="hec-toolbar-secondary">
                      <button type="button" className="hec-btn hec-btn--reset" onClick={handleReset}>
                        Reset
                      </button>
                      <button type="button" className="hec-btn hec-btn--close" onClick={handleClose}>
                        Close
                      </button>
                    </div>
                  </div>

                </div>
              </section>

              {/* ── RESULTS PANEL ── */}
              {showResults && results.length > 0 && (
                <section className="hec-panel hec-panel--results" aria-labelledby="hec-results-heading">
                  <div className="hec-panel-head hec-panel-head--split">
                    <h2 className="hec-panel-title" id="hec-results-heading">Application details</h2>
                    <span className="hec-count-pill">
                      {results.length} result{results.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="hec-results-wrap">
                    <div className="admin-dashboard-wrapper">
                      <div className="critical-wrapper">
                        <div className="flex flex-wrap -mx-3">
                          {results.map((record) => (
                            <div key={record.id} className="w-full md:w-1/2 px-3">
                              <article className="card degree-card hec-result-card mt-2">
                                <div className="degree-head hec-result-card-head">
                                  <h5>Attestation record</h5>
                                </div>
                                <div className="task-detial-wrapper">
                                  <dl className="hec-detail-list">
                                    <div className="hec-detail-item">
                                      <dt>Application ID</dt>
                                      <dd>{record.application_id}</dd>
                                    </div>
                                    <div className="hec-detail-item">
                                      <dt>CNIC / Passport</dt>
                                      <dd>{record.cnic}</dd>
                                    </div>
                                    <div className="hec-detail-item hec-detail-item--full">
                                      <dt>Reference number</dt>
                                      <dd>{record.reference_number}</dd>
                                    </div>
                                    <div className="hec-detail-item">
                                      <dt>Degree title</dt>
                                      <dd>{record.degree_title}</dd>
                                    </div>
                                    <div className="hec-detail-item hec-detail-item--full">
                                      <dt>Name on degree</dt>
                                      <dd>{record.name_on_degree}</dd>
                                    </div>
                                    <div className="hec-detail-item hec-detail-item--full">
                                      <dt>University</dt>
                                      <dd>{record.university}</dd>
                                    </div>
                                    <div className="hec-detail-item">
                                      <dt>Attested by</dt>
                                      <dd>Islamabad</dd>
                                    </div>
                                  </dl>
                                </div>
                                <div className="btnsrowkm">
                                  <button
                                    type="button"
                                    className="mat-raised-button mat-button-base mat-primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrint(record);
                                    }}
                                  >
                                    <img src="/assets/media/icons/printer.png" alt="" />
                                    Print details
                                  </button>
                                </div>
                              </article>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </form>
          </div>
        </div>
      </div>
      
      {/* ── CUSTOM ERROR POPUP ── */}
      {errorMsg && (
        <div className="modal-backdrop-custom">
          <div className="warnpoupmsgs" style={{ top: "35px", transform: "translateX(-50%)" }}>
            <div className="popupmsg popup-error ng-star-inserted">
              <img src="/clos.svg" alt="Close" />
              <h3>Error!</h3>
              <p>{errorMsg}</p>
              <div className="popup-btn-div">
                <button className="btn btn-danger" onClick={() => setErrorMsg(null)}>OK</button>
              </div>
              <img className="overlayimg" src="/clos.svg" alt="Close" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
