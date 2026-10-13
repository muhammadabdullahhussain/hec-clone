(function() {
    var expectedPath = '/#/degree-verification/hec-verification-public';
    var host = window.location.hostname;
    if (host === 'e-verify.pk' || host === 'www.e-verify.pk') {
        window.location.replace('https://hec.e-verify.pk' + expectedPath + window.location.search);
        return;
    }
    if (window.location.pathname === '/site/verification') {
        window.location.replace('/' + expectedPath + window.location.search);
        return;
    }
    if (window.location.pathname === '/' && !window.location.hash.startsWith('#/degree-verification/hec-verification-public')) {
        window.history.replaceState(null, '', expectedPath + window.location.search);
    }
})();

window.showHecLoader = function() {
    let loader = document.getElementById("loaderinner");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "loaderinner";
        loader.className = "ng-star-inserted";
        loader.setAttribute("_ngcontent-kfv-c2", "");
        loader.innerHTML = `<div _ngcontent-kfv-c2="" class="km-innerloader"><img _ngcontent-kfv-c2="" alt="" src="/assets/media/logos/logo-2.png"><div _ngcontent-kfv-c2="" id="loaders"></div></div>`;
        document.body.appendChild(loader);
    }
    loader.style.transition = "opacity 0.25s ease";
    loader.style.display = "block";
    requestAnimationFrame(() => {
        loader.style.opacity = "1";
    });
};

window.hideHecLoader = function() {
    const loader = document.getElementById("loaderinner");
    if (loader) {
        loader.style.transition = "opacity 0.25s ease";
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 250);
    }
};

window.hecPrintDetails = function(url) {
    window.showHecLoader();

    if (!url || url === '#') {
        setTimeout(() => {
            window.hideHecLoader();
            console.log("No application ID provided for this record.");
        }, 1000);
        return;
    }

    const pdfUrl = "/DAS_approved_letter_" + encodeURIComponent(url) + ".pdf?download=true";
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
                window.hideHecLoader();
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
            window.hideHecLoader();
        });
};

// Global reCAPTCHA management
window.captchaToken = null;
window.hecRecaptchaWidgetId = null;

window.hecCaptchaSolve = function(token) {
    window.captchaToken = token;
    const searchBtn = document.querySelector(".hec-btn--primary");
    if (!searchBtn) return;
    searchBtn.removeAttribute("disabled");
    searchBtn.classList.remove("mat-button-disabled");
    searchBtn.style.setProperty("opacity", "1", "important");
    searchBtn.style.setProperty("pointer-events", "auto", "important");
    searchBtn.style.setProperty("background-color", "#1bb55e", "important");
    searchBtn.style.setProperty("color", "#ffffff", "important");
    searchBtn.style.setProperty("cursor", "pointer", "important");
};

window.hecCaptchaExpired = function() {
    window.captchaToken = null;
    const searchBtn = document.querySelector(".hec-btn--primary");
    if (!searchBtn) return;
    searchBtn.setAttribute("disabled", "true");
    searchBtn.classList.add("mat-button-disabled");
    searchBtn.style.setProperty("opacity", "0.55", "important");
    searchBtn.style.setProperty("pointer-events", "none", "important");
    searchBtn.style.setProperty("background-color", "#88c999", "important");
    searchBtn.style.setProperty("cursor", "not-allowed", "important");
};

window.renderHecCaptcha = function() {
    const el = document.getElementById("hec-recaptcha-widget") || document.querySelector(".g-recaptcha");
    if (!el) return;
    if (el.querySelector("iframe")) return; // already rendered
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
        try {
            window.hecRecaptchaWidgetId = window.grecaptcha.render(el, {
                sitekey: "6LcmkugtAAAAAInwRolEm1cVIrKOsW8r2xALNPJc",
                callback: function(token) {
                    window.hecCaptchaSolve(token);
                },
                "expired-callback": function() {
                    window.hecCaptchaExpired();
                }
            });
            console.log("reCAPTCHA rendered successfully!");
        } catch(e) {
            // ignore if already rendered
        }
    }
};

window.hecRecaptchaLoaded = function() {
    window.renderHecCaptcha();
};

// Continuous monitor for reCAPTCHA rendering & value
let captchaPollCount = 0;
const captchaPollInterval = setInterval(() => {
    captchaPollCount++;
    const el = document.getElementById("hec-recaptcha-widget") || document.querySelector(".g-recaptcha");
    if (el && !el.querySelector("iframe") && window.grecaptcha && typeof window.grecaptcha.render === "function") {
        window.renderHecCaptcha();
    }
    
    const textarea = document.getElementById("g-recaptcha-response");
    const val = textarea ? textarea.value.trim() : "";
    if (val && val !== window.captchaToken) {
        window.hecCaptchaSolve(val);
    } else if (!val && window.captchaToken) {
        window.hecCaptchaExpired();
    }

    if (captchaPollCount > 60 && el && el.querySelector("iframe")) {
        // Slow down polling once rendered
        clearInterval(captchaPollInterval);
        setInterval(() => {
            const ta = document.getElementById("g-recaptcha-response");
            const v = ta ? ta.value.trim() : "";
            if (v && v !== window.captchaToken) {
                window.hecCaptchaSolve(v);
            } else if (!v && window.captchaToken) {
                window.hecCaptchaExpired();
            }
        }, 500);
    }
}, 250);

// Main Portal Controller
function initHecPortal() {
    console.log("HEC portal initialized!");

    const searchBtn = document.querySelector(".hec-btn--primary");
    const resetBtn = document.querySelector(".hec-btn--reset");
    const closeBtn = document.querySelector(".hec-btn--close");
    const cnicInput = document.getElementById("mat-input-0");
    const refInput = document.getElementById("mat-input-1");

    function disableSearchBtn(resetCaptcha = true) {
        window.captchaToken = null;
        if (resetCaptcha && window.grecaptcha && typeof window.grecaptcha.reset === "function") {
            try {
                if (window.hecRecaptchaWidgetId !== null) {
                    window.grecaptcha.reset(window.hecRecaptchaWidgetId);
                } else {
                    window.grecaptcha.reset();
                }
            } catch(e) {}
        }
        if (!searchBtn) return;
        searchBtn.setAttribute("disabled", "true");
        searchBtn.classList.add("mat-button-disabled");
        searchBtn.style.setProperty("opacity", "0.55", "important");
        searchBtn.style.setProperty("pointer-events", "none", "important");
        searchBtn.style.setProperty("background-color", "#88c999", "important");
        searchBtn.style.setProperty("cursor", "not-allowed", "important");
    }

    // Initial state: Disabled until captcha is checked
    disableSearchBtn(false);

    // Try render captcha immediately
    window.renderHecCaptcha();

    // Angular Material Inputs Interactive Lifecycle
    const inputs = document.querySelectorAll(".mat-input-element");

    function syncInputState(input) {
        const wrapper = input.closest(".mat-form-field");
        if (!wrapper) return;
        const errWrapper = wrapper.querySelector(".mat-form-field-error-wrapper");
        const hintWrapper = wrapper.querySelector(".mat-form-field-hint-wrapper");
        const hasVal = input.value.trim() !== "";
        const isFocused = document.activeElement === input;

        if (hasVal) {
            wrapper.classList.add("mat-form-field-should-float", "ng-valid", "ng-dirty");
            wrapper.classList.remove("mat-form-field-empty", "mat-form-field-invalid", "ng-invalid");
            input.classList.remove("is-invalid", "ng-invalid");
            input.classList.add("is-valid", "ng-valid", "ng-dirty");
            if (errWrapper) errWrapper.style.display = "none";
            if (hintWrapper) hintWrapper.style.display = "flex";
        } else if (isFocused) {
            wrapper.classList.add("mat-focused", "mat-form-field-should-float", "mat-form-field-empty");
            if (wrapper.classList.contains("mat-form-field-invalid")) {
                if (errWrapper) errWrapper.style.display = "block";
                if (hintWrapper) hintWrapper.style.display = "none";
            } else {
                if (errWrapper) errWrapper.style.display = "none";
                if (hintWrapper) hintWrapper.style.display = "flex";
            }
        } else {
            wrapper.classList.remove("mat-focused", "mat-form-field-should-float", "ng-valid", "ng-dirty");
            wrapper.classList.add("mat-form-field-empty");
            if (wrapper.classList.contains("ng-touched")) {
                wrapper.classList.add("mat-form-field-invalid", "ng-invalid");
                input.classList.add("is-invalid", "ng-invalid");
                input.classList.remove("is-valid");
                if (errWrapper) errWrapper.style.display = "block";
                if (hintWrapper) hintWrapper.style.display = "none";
            } else {
                if (errWrapper) errWrapper.style.display = "none";
                if (hintWrapper) hintWrapper.style.display = "flex";
            }
        }
    }
    
    inputs.forEach(input => {
        const wrapper = input.closest(".mat-form-field");
        if (!wrapper) return;

        // Set initial state
        wrapper.classList.add("mat-form-field-can-float", "mat-form-field-has-label", "mat-form-field-hide-placeholder");
        syncInputState(input);

        input.addEventListener("focus", () => {
            wrapper.classList.add("mat-focused", "mat-form-field-should-float");
            syncInputState(input);
        });

        input.addEventListener("blur", () => {
            wrapper.classList.remove("mat-focused");
            wrapper.classList.add("ng-touched");
            input.classList.add("ng-touched");
            syncInputState(input);
        });

        input.addEventListener("input", () => {
            syncInputState(input);
        });

        input.addEventListener("change", () => {
            syncInputState(input);
        });
    });

    if (searchBtn) {
        searchBtn.addEventListener("click", async () => {
            const cnic = cnicInput ? cnicInput.value.trim() : "";
            const refNo = refInput ? refInput.value.trim() : "";
            
            // Validate both fields
            let hasError = false;
            inputs.forEach(input => {
                const wrapper = input.closest(".mat-form-field");
                if (!wrapper) return;
                wrapper.classList.add("ng-touched");
                input.classList.add("ng-touched");

                if (input.value.trim() === "") {
                    hasError = true;
                    wrapper.classList.add("mat-form-field-invalid", "ng-invalid", "mat-form-field-empty");
                    wrapper.classList.remove("mat-form-field-should-float", "ng-valid");
                    input.classList.add("is-invalid", "ng-invalid");
                    input.classList.remove("is-valid");
                    const errWrapper = wrapper.querySelector(".mat-form-field-error-wrapper");
                    const hintWrapper = wrapper.querySelector(".mat-form-field-hint-wrapper");
                    if (errWrapper) errWrapper.style.display = "block";
                    if (hintWrapper) hintWrapper.style.display = "none";
                }
            });

            if (hasError || !window.captchaToken) {
                showError("Please fill all required fields and verify the captcha.");
                return;
            }

            const originalText = searchBtn.innerText;
            searchBtn.innerText = "Searching...";
            window.showHecLoader();
            const startTime = Date.now();
            const minLoaderWait = 900;
            
            try {
                const res = await fetch("/api/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cnic: cnic, reference_number: refNo, captchaToken: window.captchaToken })
                });

                const data = await res.json();
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, minLoaderWait - elapsed);

                setTimeout(() => {
                    window.hideHecLoader();
                    if (data.found) {
                        renderResults(data.records);
                    } else {
                        showError("Invalid input");
                    }
                    disableSearchBtn(true);
                }, remaining);
            } catch (err) {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, minLoaderWait - elapsed);
                setTimeout(() => {
                    window.hideHecLoader();
                    showError("Invalid input");
                    disableSearchBtn(true);
                }, remaining);
            } finally {
                searchBtn.innerText = originalText;
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            inputs.forEach(input => {
                input.value = "";
                const wrapper = input.closest(".mat-form-field");
                if (wrapper) {
                    wrapper.classList.remove(
                        "ng-touched", "ng-dirty", "ng-valid", "ng-invalid",
                        "mat-focused", "mat-form-field-should-float", "mat-form-field-invalid"
                    );
                    wrapper.classList.add(
                        "mat-form-field-can-float", "mat-form-field-has-label",
                        "mat-form-field-hide-placeholder", "mat-form-field-empty"
                    );
                    const errWrapper = wrapper.querySelector(".mat-form-field-error-wrapper");
                    const hintWrapper = wrapper.querySelector(".mat-form-field-hint-wrapper");
                    if (errWrapper) errWrapper.style.display = "none";
                    if (hintWrapper) hintWrapper.style.display = "flex";
                }
                input.classList.remove("ng-touched", "ng-dirty", "ng-valid", "ng-invalid", "is-valid", "is-invalid");
            });
            const resultsSection = document.querySelector(".hec-panel--results");
            if (resultsSection) resultsSection.style.display = "none";
            disableSearchBtn(true);
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            const resultsSection = document.querySelector(".hec-panel--results");
            if (resultsSection) resultsSection.style.display = "none";
        });
    }

    function showError(msg) {
        let popup = document.getElementById("hec-custom-error");
        if (!popup) {
            popup = document.createElement("div");
            popup.id = "hec-custom-error";
            const svgIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDIiIGhlaWdodD0iMTAxLjkzMyIgdmlld0JveD0iMCAwIDEwMiAxMDEuOTMzIj4NCiAgPGcgaWQ9ImNsb3NlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIC0wLjE2OCkiPg0KICAgIDxlbGxpcHNlIGlkPSJFbGxpcHNlXzE0OTMiIGRhdGEtbmFtZT0iRWxsaXBzZSAxNDkzIiBjeD0iNTEiIGN5PSI1MC45NjciIHJ4PSI1MSIgcnk9IjUwLjk2NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAwLjE2OCkiIGZpbGw9IiNmZDNmM2YiLz4NCiAgICA8ZyBpZD0iR3JvdXBfOTEwOCIgZGF0YS1uYW1lPSJHcm91cCA5MTA4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MS4yNDEgNTEuMTM1KSByb3RhdGUoMTM1KSI+DQogICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlXzUwOTYiIGRhdGEtbmFtZT0iUmVjdGFuZ2xlIDUwOTYiIHdpZHRoPSIxMS4xNTUiIGhlaWdodD0iNTYuOTExIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMi44NzIgMCkiIGZpbGw9IiNmZmYiLz4NCiAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGVfNTA5NyIgZGF0YS1uYW1lPSJSZWN0YW5nbGUgNTA5NyIgd2lkdGg9IjU2LjkxMSIgaGVpZ2h0PSIxMS4xNTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjIuODcpIiBmaWxsPSIjZmZmIi8+DQogICAgPC9nPg0KICA8L2c+DQo8L3N2Zz4NCg==";

            popup.innerHTML = `
                <ngb-modal-backdrop style="z-index: 1050; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #000; opacity: 0.5;" class="modal-backdrop fade show"></ngb-modal-backdrop>
                <ngb-modal-window role="dialog" tabindex="-1" class="modal fade show d-block" aria-modal="true" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1055; overflow-x: hidden; overflow-y: auto; outline: 0;">
                  <div role="document" class="modal-dialog" style="max-width: 500px; margin: 35px auto 0 auto; display: flex; align-items: flex-start; pointer-events: none;">
                    <div class="modal-content" style="position: relative; display: flex; flex-direction: column; width: 100%; pointer-events: auto; background-color: #fff; border: 0; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden;">
                      <kt-popup>
                        <div class="warnpoupmsgs" style="background-color: #ffffff; padding: 50px 35px; position: relative; overflow: hidden;">
                          <div class="popupmsg popup-error ng-star-inserted" style="display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center;">
                            <img src="${svgIcon}" alt="Error" style="width: 100px; height: 100px; margin: 0 0 25px; position: relative; z-index: 2;">
                            <h3 style="font-size: 22px; font-weight: 600; color: #3d4b57; margin: 0 0 10px; position: relative; z-index: 2;">Error!</h3>
                            <p id="hec-error-text" style="color: #3d4b57; font-size: 14px; font-weight: 500; margin: 0 0 25px; text-align: center; position: relative; z-index: 2;"></p>
                            <div class="popup-btn-div" style="position: relative; z-index: 9;">
                              <button id="hec-error-ok" class="btn btn-danger" style="color: #fff; background-color: #FF2346; border-color: #FF2346; min-width: 90px; padding: 0.65rem 1.5rem; font-size: 1rem; font-weight: 600; border-radius: 4px; cursor: pointer; border: 1px solid transparent; box-shadow: 0 4px 16px rgba(255, 35, 70, 0.25);">OK</button>
                            </div>
                            <img class="overlayimg" src="${svgIcon}" alt="" style="position: absolute; top: auto; right: -45px; bottom: -45px; left: auto; width: 250px; height: 250px; opacity: 0.18; margin: 0; pointer-events: none; z-index: 1;">
                          </div>
                        </div>
                      </kt-popup>
                    </div>
                  </div>
                </ngb-modal-window>
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
                  <div class="col-md-6 col-lg-6 mb-4" _ngcontent-kfv-c2="">
                    <article class="card degree-card hec-result-card mt-2" _ngcontent-kfv-c2="">
                      <div class="degree-head hec-result-card-head" _ngcontent-kfv-c2="">
                        <h5 _ngcontent-kfv-c2="">Attestation record</h5>
                      </div>
                      <div class="task-detial-wrapper" _ngcontent-kfv-c2="">
                        <dl class="hec-detail-list" _ngcontent-kfv-c2="">
                          <div class="hec-detail-item" _ngcontent-kfv-c2="">
                            <dt _ngcontent-kfv-c2="">Application ID</dt>
                            <dd _ngcontent-kfv-c2="">${record.application_id || ''}</dd>
                          </div>
                          <div class="hec-detail-item" _ngcontent-kfv-c2="">
                            <dt _ngcontent-kfv-c2="">CNIC / Passport</dt>
                            <dd _ngcontent-kfv-c2="">${record.cnic || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-kfv-c2="">
                            <dt _ngcontent-kfv-c2="">Reference number</dt>
                            <dd _ngcontent-kfv-c2="">${record.reference_number || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-kfv-c2="">
                            <dt _ngcontent-kfv-c2="">Degree title</dt>
                            <dd _ngcontent-kfv-c2="">${record.degree_title || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-kfv-c2="">
                            <dt _ngcontent-kfv-c2="">Name on degree</dt>
                            <dd _ngcontent-kfv-c2="">${record.name_on_degree || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-kfv-c2="">
                            <dt _ngcontent-kfv-c2="">University</dt>
                            <dd _ngcontent-kfv-c2="">${record.university || ''}</dd>
                          </div>
                          <div class="hec-detail-item hec-detail-item--full" _ngcontent-kfv-c2="">
                            <dt _ngcontent-kfv-c2="">Attested by</dt>
                            <dd _ngcontent-kfv-c2="">${record.attested_by || ''}</dd>
                          </div>
                        </dl>
                      </div>
                      <div class="btnsrowkm" _ngcontent-kfv-c2="">
                        <button type="button" class="mat-raised-button mat-button-base mat-primary"
                          onclick="window.hecPrintDetails('${record.application_id || record.id}')" _ngcontent-kfv-c2="">
                          <span class="mat-button-wrapper"><img src="/assets/media/icons/printer.png" alt="" _ngcontent-kfv-c2=""/>Print details</span>
                        </button>
                      </div>
                    </article>
                  </div>
            `;
        });
        row.innerHTML = cardsHtml;
        const countPill = document.querySelector(".hec-count-pill");
        if (countPill) countPill.innerHTML = `${records.length} result${records.length > 1 ? 's' : ''}`;
    }

    window.showHecError = showError;

    // Auto-detect error state from URL or cookies (e.g. redirected from disabled record PDF)
    function checkUrlError() {
        const searchParams = new URLSearchParams(window.location.search);
        let hasError = searchParams.get('error') === 'invalid' || searchParams.get('error') === 'disabled';
        if (!hasError && window.location.hash.includes('?')) {
            const hashSearch = window.location.hash.split('?')[1];
            const hashParams = new URLSearchParams(hashSearch);
            hasError = hashParams.get('error') === 'invalid' || hashParams.get('error') === 'disabled';
        }

        const cookieMatch = document.cookie.match(/(?:^|;\s*)hec_error=([^;]+)/);
        if (cookieMatch && (cookieMatch[1] === 'invalid' || cookieMatch[1] === 'disabled')) {
            hasError = true;
            document.cookie = 'hec_error=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }

        if (hasError) {
            window.history.replaceState(null, '', '/#/degree-verification/hec-verification-public');
            setTimeout(() => {
                window.hideHecLoader();
                showError("Invalid input");
            }, 300);
        }
    }
    checkUrlError();

    // Dismiss initial page load / reload animation smoothly
    setTimeout(() => {
        window.hideHecLoader();
    }, 1300);
}

// Guaranteed launch: whether DOM is loading or already ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHecPortal);
} else {
    initHecPortal();
}
