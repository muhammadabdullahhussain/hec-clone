
if (window.location.pathname === '/' && !window.location.hash.startsWith('#/degree-verification/hec-verification-public')) {
    const searchParams = window.location.search;
    window.history.replaceState(null, '', '/#/degree-verification/hec-verification-public' + searchParams);
}


window.hecPrintDetails = function(url) {
    let loader = document.getElementById("loaderinner");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "loaderinner";
        loader.className = "ng-star-inserted";
        loader.setAttribute("_ngcontent-cgw-c2", "");
        loader.innerHTML = `<div _ngcontent-cgw-c2="" class="km-innerloader"><img _ngcontent-cgw-c2="" alt="" src="./assets/media/logos/logo-2.png"><div _ngcontent-cgw-c2="" id="loaders"></div></div>`;
        document.body.appendChild(loader);
    }
    loader.style.display = "block";

    if (!url || url === '#') {
        setTimeout(() => {
            loader.style.display = "none";
            console.log("No application ID provided for this record.");
        }, 1000);
        return;
    }

    const pdfUrl = "/api/test-pdf?id=" + encodeURIComponent(url);
    const fileName = "DAS_approved_letter_" + url + ".pdf";
    const startTime = Date.now();
    const minWaitMs = 2000;

    fetch(pdfUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Download request failed with status: " + response.status);
            }
            return response.blob();
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

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minWaitMs - elapsed);
            setTimeout(() => {
                loader.style.display = "none";
            }, remaining);
        })
        .catch(err => {
            console.error("Blob download error, falling back to direct anchor download:", err);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = pdfUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            loader.style.display = "none";
        });
};

window.captchaToken = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("HEC script loaded!");

    // FOOLPROOF POLLING FOR RECAPTCHA
    let captchaPoller = setInterval(() => {
        const textarea = document.getElementById("g-recaptcha-response");
        if (textarea && textarea.value) {
            window.captchaToken = textarea.value;
            console.log("CAPTCHA TOKEN FOUND VIA POLLING!");
            const searchBtn = document.querySelector(".hec-btn--primary");
            if (searchBtn) {
                // Forcibly enable and style the button so it is 100% visible
                searchBtn.removeAttribute("disabled");
                searchBtn.classList.remove("mat-button-disabled");
                searchBtn.style.setProperty("opacity", "1", "important");
                searchBtn.style.setProperty("pointer-events", "auto", "important");
                searchBtn.style.setProperty("background-color", "#1bb55e", "important"); // Force dark green
                searchBtn.style.setProperty("color", "#ffffff", "important");
                searchBtn.style.setProperty("cursor", "pointer", "important");
                clearInterval(captchaPoller);
                // Also trigger click event directly to test if they want it to just search automatically? No, user must click.
            }
        }
    }, 500);

    const searchBtn = document.querySelector(".hec-btn--primary");
    const resetBtn = document.querySelector(".hec-btn--reset");
    const closeBtn = document.querySelector(".hec-btn--close");
    const cnicInput = document.getElementById("mat-input-0");
    const refInput = document.getElementById("mat-input-1");

    // Inject valid/invalid CSS just in case original CSS missed it
    const style = document.createElement("style");
    style.innerHTML = `
        .mat-form-field.ng-valid.ng-touched:not(.mat-focused) .mat-form-field-outline-thick,
        .mat-form-field.ng-valid.ng-touched:not(.mat-focused) .mat-form-field-outline {
            color: #1bb55e !important;
        }
        .mat-form-field.ng-valid.ng-touched .mat-form-field-label {
            color: #1bb55e !important;
        }
        .mat-form-field.ng-invalid.ng-touched .mat-form-field-outline-thick,
        .mat-form-field.ng-invalid.ng-touched .mat-form-field-outline {
            color: #f44336 !important;
        }
        .mat-form-field-label,
        .mat-form-field-appearance-outline .mat-form-field-label,
        .mat-form-field-appearance-outline.mat-form-field-can-float.mat-form-field-should-float .mat-form-field-label {
            display: block !important;
            transform: translateY(-1.35em) scale(0.75) !important;
            width: auto !important;
            max-width: none !important;
            overflow: visible !important;
            padding: 0 4px !important;
            background-color: #ffffff !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            color: #3f4b57 !important;
            z-index: 4 !important;
        }
        mat-label {
            display: inline !important;
            transform: none !important;
            width: auto !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            color: inherit !important;
        }
        .mat-placeholder-required,
        .mat-form-field-required-marker {
            color: #dc3545 !important;
            font-weight: 700 !important;
            margin-left: 2px !important;
            display: inline !important;
        }
        .mat-form-field-appearance-outline.mat-form-field-can-float.mat-form-field-should-float .mat-form-field-outline-gap {
            border-top-color: transparent !important;
        }
        .btnsrowkm .mat-raised-button:hover {
            background-color: #ffffff !important;
            border: 1px solid #1bb55e !important;
            color: #1bb55e !important;
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .btnsrowkm .mat-raised-button {
            border: 1px solid transparent; /* prevent jitter when border is added on hover */
        }
    `;
    document.head.appendChild(style);

    // Fix Angular Material Inputs - Always keep label floating on top
    const inputs = document.querySelectorAll(".mat-input-element");
    
    inputs.forEach(input => {
        const wrapper = input.closest(".mat-form-field");
        if (!wrapper) return;
        
        // Remove inner placeholder so it doesn't duplicate text inside the box
        input.removeAttribute("placeholder");
        input.placeholder = "";

        // Official HEC always keeps the label floating in the top outline
        wrapper.classList.add("mat-form-field-should-float", "mat-form-field-can-float", "mat-form-field-has-label");

        input.addEventListener("focus", () => {
            wrapper.classList.add("mat-focused", "mat-form-field-should-float");
        });

        input.addEventListener("blur", () => {
            wrapper.classList.remove("mat-focused");
            wrapper.classList.add("mat-form-field-should-float", "ng-touched");
            
            if (input.value.trim() === "") {
                wrapper.classList.remove("ng-valid");
                wrapper.classList.add("ng-invalid");
                input.classList.add("is-invalid");
                input.classList.remove("is-valid");
            } else {
                wrapper.classList.add("ng-valid", "ng-dirty");
                wrapper.classList.remove("ng-invalid");
                input.classList.add("is-valid");
                input.classList.remove("is-invalid");
            }
        });

        input.addEventListener("input", () => {
            wrapper.classList.add("mat-form-field-should-float");
            if (input.value.trim() !== "") {
                wrapper.classList.add("ng-valid", "ng-dirty");
                wrapper.classList.remove("ng-invalid");
                input.classList.add("is-valid");
                input.classList.remove("is-invalid");
            } else {
                wrapper.classList.remove("ng-valid");
                wrapper.classList.add("ng-invalid");
                input.classList.add("is-invalid");
                input.classList.remove("is-valid");
            }
        });
    });

    if (searchBtn) {
        searchBtn.addEventListener("click", async () => {
            const cnic = cnicInput.value;
            const refNo = refInput.value;
            
            // Force touched
            cnicInput.closest(".mat-form-field").classList.add("ng-touched");
            refInput.closest(".mat-form-field").classList.add("ng-touched");

            if (!cnic || !refNo || !window.captchaToken) {
                showError("Please fill all required fields and verify the captcha.");
                return;
            }

            const originalText = searchBtn.innerText;
            searchBtn.innerText = "Searching...";
            
            try {
                const res = await fetch("/api/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cnic: cnic, reference_number: refNo, captchaToken: window.captchaToken })
                });

                const data = await res.json();
                if (data.found) {
                    renderResults(data.records);
                    searchBtn.setAttribute("disabled", "true");
                    searchBtn.classList.add("mat-button-disabled");
                    searchBtn.style.setProperty("opacity", "0.65", "important");
                    searchBtn.style.setProperty("pointer-events", "none", "important");
                    searchBtn.style.setProperty("background-color", "#a3d9b8", "important");
                    searchBtn.style.setProperty("cursor", "default", "important");
                } else {
                    showError(data.message || "No record found for the provided CNIC and reference number.");
                    if(window.grecaptcha) window.grecaptcha.reset();
                    window.captchaToken = null;
                    searchBtn.setAttribute("disabled", "true");
                    searchBtn.style.opacity = "0.65";
                    searchBtn.style.backgroundColor = "#a3d9b8";
                    
                    // Restart poller if captcha is reset
                    captchaPoller = setInterval(() => {
                        const textarea = document.getElementById("g-recaptcha-response");
                        if (textarea && textarea.value) {
                            window.captchaToken = textarea.value;
                            searchBtn.removeAttribute("disabled");
                            searchBtn.classList.remove("mat-button-disabled");
                            searchBtn.style.setProperty("opacity", "1", "important");
                            searchBtn.style.setProperty("pointer-events", "auto", "important");
                            searchBtn.style.setProperty("background-color", "#1bb55e", "important");
                            searchBtn.style.setProperty("color", "#ffffff", "important");
                            searchBtn.style.setProperty("cursor", "pointer", "important");
                            clearInterval(captchaPoller);
                        }
                    }, 500);
                }
            } catch (err) {
                showError("An error occurred. Please try again.");
            } finally {
                searchBtn.innerText = originalText;
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            inputs.forEach(input => {
                input.value = "";
                input.removeAttribute("placeholder");
                input.placeholder = "";
                const wrapper = input.closest(".mat-form-field");
                if (wrapper) {
                    wrapper.classList.remove("ng-touched", "ng-dirty", "ng-valid", "ng-invalid", "mat-focused");
                    wrapper.classList.add("mat-form-field-should-float", "mat-form-field-can-float", "mat-form-field-has-label");
                }
                input.classList.remove("ng-touched", "ng-dirty", "ng-valid", "ng-invalid", "is-valid", "is-invalid");
            });
            document.querySelector(".hec-panel--results").style.display = "none";
            if(window.grecaptcha) window.grecaptcha.reset();
            window.captchaToken = null;
            searchBtn.setAttribute("disabled", "true");
            searchBtn.style.opacity = "0.65";
            searchBtn.style.backgroundColor = "#a3d9b8";
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.querySelector(".hec-panel--results").style.display = "none";
        });
    }

    function showError(msg) {
        let popup = document.getElementById("hec-custom-error");
        if(!popup) {
            popup = document.createElement("div");
            popup.id = "hec-custom-error";
            popup.innerHTML = `
                <div class="modal-backdrop-custom" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1040;">
                  <div class="warnpoupmsgs" style="background-color: #ffffff; padding: 50px 35px; position: fixed; top: 35px; left: 50%; transform: translateX(-50%); overflow: hidden; z-index: 1050; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 400px;">
                    <div class="popupmsg popup-error ng-star-inserted" style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#fd2826" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 0 10px; z-index: 2;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                      <h3 style="font-size: 22px; font-weight: 600; color: #3d4b57; margin-top: 15px;">Error!</h3>
                      <p id="hec-error-text" style="color: #3d4b57; font-size: 14px; font-weight: 500; margin: 15px 0 25px; text-align: center;"></p>
                      <div class="popup-btn-div" style="position: relative; z-index: 9;">
                        <button id="hec-error-ok" style="color: #fff; background-color: #fd2826; border-color: #fd2826; padding: 10px 45px; font-weight: 600; border-radius: 4px; cursor: pointer; border: 1px solid transparent;">OK</button>
                      </div>
                      <svg width="250" height="250" viewBox="0 0 24 24" fill="none" stroke="#fd2826" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: auto; right: -45px; bottom: -45px; left: auto; opacity: 0.18; margin: 0; z-index: 1;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </div>
                  </div>
                </div>
            `;
            document.body.appendChild(popup);
            document.getElementById("hec-error-ok").addEventListener("click", () => {
                popup.style.display = "none";
            });
        }
        document.getElementById("hec-error-text").innerText = msg;
        popup.style.display = "block";
    }

    function renderResults(records) {
        const resultsSection = document.querySelector(".hec-panel--results");
        if(!resultsSection) return;
        
        resultsSection.style.display = "block";
        const row = resultsSection.querySelector(".row");
        if(!row) return;
        
        let cardsHtml = "";
        records.forEach(record => {
            cardsHtml += `
                  <div class="col-md-6 col-lg-6 mb-4" _ngcontent-vlh-c2="">
                    <article class="card degree-card hec-result-card mt-2" _ngcontent-vlh-c2="">
                      <div class="degree-head hec-result-card-head" _ngcontent-vlh-c2="">
                        <h5 _ngcontent-vlh-c2="">Attestation record</h5>
                      </div>
                      <div class="task-detial-wrapper" _ngcontent-vlh-c2="">
                        <dl class="hec-detail-list" _ngcontent-vlh-c2="">
                          <div class="hec-detail-item" _ngcontent-vlh-c2="">
                            <dt _ngcontent-vlh-c2="">Application ID</dt>
                            <dd _ngcontent-vlh-c2="">${record.application_id || ''}</dd>
                          </div>
                          <div class="hec-detail-item" _ngcontent-vlh-c2="">
                            <dt _ngcontent-vlh-c2="">CNIC / Passport</dt>
                            <dd _ngcontent-vlh-c2="">${record.cnic || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-vlh-c2="">
                            <dt _ngcontent-vlh-c2="">Reference number</dt>
                            <dd _ngcontent-vlh-c2="">${record.reference_number || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-vlh-c2="">
                            <dt _ngcontent-vlh-c2="">Degree title</dt>
                            <dd _ngcontent-vlh-c2="">${record.degree_title || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-vlh-c2="">
                            <dt _ngcontent-vlh-c2="">Name on degree</dt>
                            <dd _ngcontent-vlh-c2="">${record.name_on_degree || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-vlh-c2="">
                            <dt _ngcontent-vlh-c2="">University</dt>
                            <dd _ngcontent-vlh-c2="">${record.university || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-vlh-c2="">
                            <dt _ngcontent-vlh-c2="">Attested by</dt>
                            <dd _ngcontent-vlh-c2="">${record.attested_by || ''}</dd>
                          </div>
                        </dl>
                      </div>
                      <div class="btnsrowkm" _ngcontent-vlh-c2="">
                        <button type="button" class="mat-raised-button mat-button-base mat-primary"
                          onclick="window.hecPrintDetails('${record.application_id}')" _ngcontent-vlh-c2="">
                          <span class="mat-button-wrapper"><img src="./assets/media/icons/printer.png" alt="" _ngcontent-vlh-c2=""/>Print details</span>
                        </button>
                      </div>
                    </article>
                  </div>
            `;
        });
        row.innerHTML = cardsHtml;
        document.querySelector(".hec-count-pill").innerHTML = `${records.length} result${records.length > 1 ? 's' : ''}`;
    }
});
