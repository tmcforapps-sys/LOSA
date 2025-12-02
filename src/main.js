import './style.css';
// =================================================================
// == 1. PASTE YOUR GOOGLE APPS SCRIPT URL HERE ==
// =================================================================
// =================================================================
// == 2. FORM DEFINITIONS ==
// =================================================================
const TEM_CODES = { THREATS: { T_TE: "TE: Environmental", T_TO: "TO: Operational", T_TC: "TC: Cabin/Passenger", T_TT: "TT: Team/Crew", T_TL: "TL: Latent" }, ERRORS: { E_EP: "EP: Procedural", E_EC: "EC: Communication", E_ED: "ED: Decision", E_ES: "ES: Skill-based", E_EV: "EV: Violation (Intentional)" }, UCS: { U_SOP: "UCS-SOP: Deviation from SOP", U_EQP: "UCS-EQP: Incorrect Equipment use", U_PAX: "UCS-PAX: Compromised PAX safety", U_COM: "UCS-COM: Degraded Communication" }, CM: { C_PLN: "CM-PLN: Planning", C_SOP: "CM-SOP: Procedural", C_COM: "CM-COM: Communication", C_MON: "CM-MON: Monitoring", C_WSM: "CM-WSM: Workload/Systems Management", C_SPT: "CM-SPT: Support/Teamwork" } };
const TEM_OPTIONS_MAP = { 'T': TEM_CODES.THREATS, 'E': TEM_CODES.ERRORS, 'U': TEM_CODES.UCS, 'C': TEM_CODES.CM };
const CHECKLIST_DEFINITIONS = [ { id: 'A', title: 'A. Pre-Flight & Crew Briefing', items: [ { id: 'A1', label: '1. Crew Briefing (All Crew - Flight & Cabin)', isGroup: true, subItems: [ { id: 'A11', label: '- Attendance/ Punctuality/ Grooming' }, { id: 'A12', label: '- Documentation (Flight document)' }, { id: 'A13', label: '- Review updated safety information' }, { id: 'A14', label: '- Safety/First aid/Security/DG Review' }, { id: 'A15', label: '- Service Review (if applicable)' }, { id: 'A16', label: '- TEM discussion (anticipated threats)' }, { id: 'A17', label: '- Crew Co-ordination & Communication established' } ]}, { id: 'A2', label: '2. Cabin Crew Briefing (Cabin Specific)', isGroup: true, subItems: [ { id: 'A21', label: '- Allocation of CC station' }, { id: 'A22', label: '- A/C type and equipment fitted' }, { id: 'A23', label: '- Emergency Procedures Review' }, { id: 'A24', label: '- Security Procedures Review (e.g., checked, search, risk level)' }, { id: 'A25', label: '- Special Categoried Passenger Info (e.g., PRMs, YPTA)' } ]}, { id: 'A3', label: '3. Pre-Flight Cabin Checks', isGroup: true, subItems: [ { id: 'A31', label: '- Doors (pre-flight check, serviceablility)' }, { id: 'A32', label: '- Emergency Equipment (location, serviceability)' }, { id: 'A33', label: '- Security Checks (cabin, lavatories, galleys, attendant station)' }, { id: 'A34', label: '- Cabin Cleanliness & Appearance' }, { id: 'A35', label: '- Catering/Supplies (if applicable)' }, { id: 'A36', label: '- Interphone/PA System Check' } ]} ]}, { id: 'B', title: 'B. Boarding', items: [ { id: 'B1', label: '1. Passenger Greeting & Assistance', isGroup: true, subItems: [ { id: 'B11', label: '- Monitoring carry-on baggage (size, quantity)' }, { id: 'B12', label: '- Refuelling procedure' }, { id: 'B13', label: '- Exit row briefing & compliance' }, { id: 'B14', label: '- Assistance and briefing to special categoried passengers (e.g., PRMs)' }, { id: 'B15', label: '- Managing passenger flow' } ]}, { id: 'B2', label: '2. Pre-Departure Cabin Secure', isGroup: true, subItems: [ { id: 'B21', label: '- Overhead bins closed' }, { id: 'B22', label: '- Galley equipment secured' }, { id: 'B23', label: '- Doors/Aisles/Exits clear' }, { id: 'B24', label: '- Passenger count reconciliation' }, { id: 'B25', label: '- Doors armed / Cross-check procedure' }, { id: 'B26', label: '- Welcome Announcement' } ]}, { id: 'B3', label: '3. Safety Demonstration', isGroup: true, subItems: [ { id: 'B31', label: '- Clarity, accuracy, visibility' }, { id: 'B32', label: '- Passenger attentiveness (managed if needed)' } ]} ]}, { id: 'C', title: 'C. Taxi-Out, Take-off & Climb', items: [ { id: 'C1', label: '1. Final Cabin Checks', isGroup: true, subItems: [ { id: 'C11', label: '- Take off preparation' }, { id: 'C12', label: '- Report cabin readiness' }, { id: 'C13', label: '- Cabin lighting' }, { id: 'C14', label: '- Performing Brace position' } ]}, { id: 'C2', label: '2. Response to Take-off/Climb', isGroup: true, subItems: [ { id: 'C21', label: '- Sterile Flight Deck Adherence' }, { id: 'C22', label: '- Monitoring cabin condition' }, { id: 'C23', label: '- Awareness of adhoc situation' } ]} ]}, { id: 'D', title: 'D. Cruise', items: [ { id: 'D1', label: '1. Service Delivery (if applicable)', isGroup: true, subItems: [ { id: 'D11', label: '- Efficiency, safety during service' }, { id: 'D12', label: '- Galley management' } ]}, { id: 'D2', label: '2. Cabin Surveillance', isGroup: true, subItems: [ { id: 'D21', label: '- Periodically check cabin' }, { id: 'D22', label: '- Periodically check on flght crew' }, { id: 'D23', label: '- Periodically check Lavatory' }, { id: 'D24', label: '- Response to call light and Reset' } ]}, { id: 'D3', label: '3. Passenger Handling (if any)', isGroup: true, subItems: [ { id: 'D31', label: '- Medical situations' }, { id: 'D32', label: '- Unruly/disruptive passengers' }, { id: 'D33', label: '- Others' } ]}, { id: 'D4', label: '4. Communication with Flight Crew (if any)', isGroup: true, subItems: [ { id: 'D41', label: '- Reporting irregularities (If any)' } ]}, { id: 'D5', label: '5. Turbulence Management', isGroup: true, subItems: [ { id: 'D51', label: '- Follow turbulance management procedure' }, { id: 'D52', label: '- Secure self' } ]} ]}, { id: 'E', title: 'E. Descent, Approach & Landing', items: [ { id: 'E1', label: '1. Pre-Landing Announcements & Cabin Prep', isGroup: true, subItems: [ { id: 'E11', label: '- Pre-landing preparation' } ]}, { id: 'E2', label: '2. Final Cabin Checks (Landing)', isGroup: true, subItems: [ { id: 'E21', label: '- Seatbelts, tray tables, seatbacks, PEDs, etc.' }, { id: 'E22', label: '- Report cabin readiness' }, { id: 'E23', label: '- Cabin lighting' }, { id: 'E24', label: '- Performing Brace position' } ]}, { id: 'E3', label: '3. Sterile Flight Deck Adherence' }, { id: 'E4', label: '4. Response to Landing', isGroup: true, subItems: [ { id: 'E41', label: '- Monitoring cabin condition' } ]} ]}, { id: 'F', title: 'F. Taxi-In & Disembarkation', items: [ { id: 'F1', label: '1. Arrival Duties', isGroup: true, subItems: [ { id: 'F11', label: '- Arrival Announcement' }, { id: 'F12', label: '- Cabin monitoring' }, { id: 'F13', label: '- Doors Disarmed / Cross-check procedure' }, { id: 'F14', label: '- Doors Opening Procedure' } ]}, { id: 'F2', label: '2. Disembarkation Process', isGroup: true, subItems: [ { id: 'F21', label: '- Cabin monitoring' }, { id: 'F22', label: '- Assistance to special categoried passenger' }, { id: 'F23', label: '- Refueling procedure (If any)' }, { id: 'F24', label: '- Cabin check after passenger disembarkation and Report' } ]}, { id: 'F3', label: '3. Post-Flight Cabin Checks', isGroup: true, subItems: [ { id: 'F31', label: '- Perform Security Checks' }, { id: 'F32', label: '- Perform transit duties' }, { id: 'F33', label: '- Reporting cabin defects (If any)' } ]} ]}, { id: 'G', title: 'G. Post-Flight / Debrief (Observed if possible)', items: [ { id: 'G1', label: '1. Crew Debrief', isGroup: true, subItems: [ { id: 'G11', label: '- Discussion of flight events' }, { id: 'G12', label: '- Sharing idea' }, { id: 'G13', label: '- Feedback on TEM' } ]}, { id: 'G2', label: '2. Reporting System', isGroup: true, subItems: [ { id: 'G21', label: '- Redeye' } ]} ]} ];

// =================================================================
// == 3. HELPER FUNCTIONS ==
// =================================================================

function createCheckboxGroup(baseName, typeCode, options) { let html = `<div class="checkbox-container">`; for (const code in options) { if (options.hasOwnProperty(code)) { const fieldName = `${baseName}_${typeCode}`; const inputValue = options[code]; const shortCode = code.split('_')[1] || code; html += `<label title="${options[code]}" class="inline-flex items-center space-x-1 cursor-pointer"><input type="checkbox" name="${fieldName}" value="${inputValue}" class="form-checkbox text-red-600 rounded"><span>${shortCode}</span></label>`; } } return html + `</div>`; }
function createRadioButtons(name) { const options = [ { value: 'Y', label: 'Yes' }, { value: 'N', label: 'No' }, { value: 'NA', label: 'N/A' } ]; let html = '<div class="sop-radio-group">'; options.forEach(opt => { const id = `${name}_${opt.value}`; html += `<input type="radio" id="${id}" name="${name}" value="${opt.value}">`; html += `<label for="${id}">${opt.label}</label>`; }); html += '</div>'; return html; }
function createTextArea(name, placeholder) { return `<textarea name="${name}" rows="1" class="w-full border rounded-lg narrative-textarea" placeholder="${placeholder}"></textarea>`; }
function generateChecklistHTML() { CHECKLIST_DEFINITIONS.forEach(section => { const container = document.getElementById(`checklist-container-${section.id}`); if (!container) return; let sectionHtml = ''; section.items.forEach(item => { if (item.isGroup && item.subItems) { sectionHtml += `<div class="checklist-item-group">${item.label}</div>`; } const itemsToRender = item.isGroup && item.subItems ? item.subItems : [item]; itemsToRender.forEach(subItem => { const baseName = `${subItem.id}`; sectionHtml += ` <div class="checklist-card rounded-lg p-3 md:p-4 mb-3" id="card-${baseName}"> <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"> <p class="font-semibold text-gray-800 flex-grow">${subItem.label}</p> <div class="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto"> <label class="font-bold text-sm text-gray-600">SOP Met:</label> ${createRadioButtons(`${baseName}_SOP`)} </div> </div> <div class="tem-details" id="tem-details-${baseName}"> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4 text-xs"> <div class="bg-t p-2 rounded-md"><h4 class="font-bold text-sm text-green-800 mb-1">Threats</h4>${createCheckboxGroup(baseName, 'T', TEM_OPTIONS_MAP.T)}</div> <div class="bg-e p-2 rounded-md"><h4 class="font-bold text-sm text-yellow-800 mb-1">Errors</h4>${createCheckboxGroup(baseName, 'E', TEM_OPTIONS_MAP.E)}</div> <div class="bg-u p-2 rounded-md"><h4 class="font-bold text-sm text-red-800 mb-1">UCS</h4>${createCheckboxGroup(baseName, 'U', TEM_OPTIONS_MAP.U)}</div> <div class="bg-c p-2 rounded-md"><h4 class="font-bold text-sm text-blue-800 mb-1">CM</h4>${createCheckboxGroup(baseName, 'C', TEM_OPTIONS_MAP.C)}</div> </div> <div> <label for="${baseName}_Narrative" class="font-bold text-sm text-gray-600">Narrative/Comments:</label> ${createTextArea(`${baseName}_Narrative`, 'Describe here...')} </div> </div> </div>`; }); }); container.innerHTML = sectionHtml; }); }
function addSopChangeEventHandlers() { const form = document.getElementById('checklistForm'); form.addEventListener('change', (event) => { if (event.target.matches('input[type="radio"][name$="_SOP"]')) { const radio = event.target; const baseId = radio.name.replace('_SOP', ''); const card = document.getElementById(`card-${baseId}`); const temDetails = document.getElementById(`tem-details-${baseId}`); if (card && temDetails) { temDetails.classList.remove('visible'); card.classList.remove('sop-fail-row', 'sop-pass-row'); if (radio.checked) { if (radio.value === 'N') { temDetails.classList.add('visible'); card.classList.add('sop-fail-row'); } else if (radio.value === 'Y') { card.classList.add('sop-pass-row'); } } } } }); form.addEventListener('click', (event) => { if (event.target.matches('input[type="radio"][name$="_SOP"]')) { const radio = event.target; if (radio.dataset.wasChecked === 'true') { radio.checked = false; radio.dataset.wasChecked = 'false'; radio.dispatchEvent(new Event('change', { bubbles: true })); } else { radio.dataset.wasChecked = 'true'; document.querySelectorAll(`input[name="${radio.name}"]`).forEach(el => { if (el !== radio) el.dataset.wasChecked = 'false'; }); } } }); }
function setTodayDate() { const today = new Date().toISOString().split('T')[0]; document.getElementById('observationDate').value = today; document.getElementById('reportCompletionDate').value = today; }
function collectFormDataForSheets(form) { const formData = new FormData(form); const data = {}; const checkboxData = {}; formData.forEach((value, key) => { const element = form.elements[key]; if (element && element.type !== 'checkbox' && element.type !== 'radio') { data[key] = value.trim(); } }); const radios = form.querySelectorAll('input[type="radio"]:checked'); radios.forEach(radio => { data[radio.name] = radio.value; }); const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked:not(.page-completion-checkbox)'); checkboxes.forEach(cb => { if (!checkboxData[cb.name]) { checkboxData[cb.name] = []; } checkboxData[cb.name].push(cb.value); }); for (const key in checkboxData) { data[key] = checkboxData[key].join(' | '); } data.submissionTimestamp = new Date().toISOString(); const completedCheckboxes = form.querySelectorAll('.page-completion-checkbox:checked'); const completedIndices = Array.from(completedCheckboxes).map(cb => cb.dataset.stepIndex); data.completedSteps = completedIndices.join(','); return data; }
function saveLocalData(form) { const data = collectFormDataForSheets(form); localStorage.setItem('losaDraft', JSON.stringify(data)); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Draft saved locally!', text: `บันทึกร่างเวลา: ${new Date().toLocaleTimeString()}`, showConfirmButton: false, timer: 2000 }); }
function loadLocalData(form) { const draft = localStorage.getItem('losaDraft'); if (!draft) return; const data = JSON.parse(draft); const lastSaved = data.draftSavedTimestamp || new Date(data.submissionTimestamp).toLocaleString() || 'N/A'; Swal.fire({ title: 'Resume Draft?', html: `พบร่างที่บันทึกไว้ในเครื่องครั้งล่าสุดเมื่อ: **${lastSaved}**<br>คุณต้องการโหลดร่างนี้เพื่อทำต่อหรือไม่?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#F97316', cancelButtonColor: '#6B7280', confirmButtonText: 'Yes, load draft' }).then((result) => { if (result.isConfirmed) { for (const key in data) { const valueFromDraft = data[key]; if (key === 'submissionTimestamp' || key === 'completedSteps') continue; const elements = form.elements[key]; if (!elements) continue; if (elements.nodeName === 'INPUT' && elements.type === 'radio') { const radioToSelect = document.querySelector(`input[name="${key}"][value="${valueFromDraft}"]`); if (radioToSelect) { radioToSelect.checked = true; radioToSelect.dataset.wasChecked = 'true'; radioToSelect.dispatchEvent(new Event('change', { bubbles: true })); } } else if (elements.length > 0 && elements[0].type === 'radio') { const radioToSelect = document.querySelector(`input[name="${key}"][value="${valueFromDraft}"]`); if (radioToSelect) { radioToSelect.checked = true; radioToSelect.dataset.wasChecked = 'true'; radioToSelect.dispatchEvent(new Event('change', { bubbles: true })); } } else if (elements.length > 0 && elements[0].type === 'checkbox') { const savedValues = String(valueFromDraft).split(' | '); document.querySelectorAll(`input[name="${key}"]`).forEach(input => { if (input.classList.contains('page-completion-checkbox')) return; input.checked = savedValues.includes(input.value); }); } else if (elements.type === 'select-one' || elements.tagName === 'SELECT') { elements.value = valueFromDraft; } else { elements.value = valueFromDraft; } } if (data.completedSteps) { const completedIndices = data.completedSteps.split(','); completedIndices.forEach(indexStr => { const index = parseInt(indexStr, 10); const checkbox = document.getElementById(`step-complete-${index}`); if (checkbox) { checkbox.checked = true; checkbox.dispatchEvent(new Event('change', { bubbles: true })); } }); } checkFirstPageCompletion(); Swal.fire('Draft Loaded!', 'คุณสามารถทำต่อได้เลย.', 'success'); } }); }
function convertToCSV(data) { const keys = Object.keys(data); const header = keys.join(','); const sanitize = (value) => { if (value === null || value === undefined) return ''; let stringValue = String(value); stringValue = stringValue.replace(/\n/g, ' '); if (stringValue.includes(',') || stringValue.includes('"')) { stringValue = stringValue.replace(/"/g, '""'); return `"${stringValue}"`; } return stringValue; }; const row = keys.map(key => sanitize(data[key])).join(','); return header + '\n' + row; }
function exportToCSV(form) { const reportData = collectFormDataForSheets(form); const csvContent = convertToCSV(reportData); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const date = document.getElementById('observationDate').value || new Date().toISOString().split('T')[0]; const flightNumber = document.getElementById('flightNumberNew').value || 'LOSA_Report'; const simpleDate = date.replace(/-/g, ''); const filename = `${simpleDate}_${flightNumber.toUpperCase()}_LOSA_DATA.csv`; if (navigator.msSaveBlob) { navigator.msSaveBlob(blob, filename); } else { const link = document.createElement('a'); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute('href', url); link.setAttribute('download', filename); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } } Swal.fire({ icon: 'info', title: 'CSV Exported!', text: `Data saved as ${filename}.`, timer: 3000, showConfirmButton: false }); }

// =================================================================
// == 4. MULTI-STEP FORM LOGIC ==
// =================================================================
let currentStep = 0; let formSteps = []; let stepperItems = [];
function showStep(stepIndex) { formSteps.forEach(step => step.classList.remove('active')); formSteps[stepIndex].classList.add('active'); stepperItems.forEach((step, index) => { step.classList.toggle('active', index === stepIndex); }); currentStep = stepIndex; const prevBtn = document.getElementById('prevBtn'); const nextBtn = document.getElementById('nextBtn'); const submitBtn = document.getElementById('submitBtn'); prevBtn.classList.toggle('hidden', stepIndex === 0); nextBtn.classList.toggle('hidden', stepIndex === formSteps.length - 1); submitBtn.classList.toggle('hidden', stepIndex !== formSteps.length - 1); }
function createStepper() { const stepperContainer = document.getElementById('form-stepper'); stepperContainer.innerHTML = ''; stepperItems = []; formSteps.forEach((step, index) => { const titleElement = step.querySelector('.step-title'); const titleText = titleElement ? titleElement.textContent : `Step ${index + 1}`; const stepElement = document.createElement('div'); stepElement.classList.add('step'); stepElement.innerHTML = `<span class="step-title">${titleText.split('. ')[1] || titleText}</span>`; stepElement.title = titleText; stepElement.addEventListener('click', () => { if (currentStep === 0 && index > 0) { if (!checkFirstPageCompletion()) { Swal.fire({ icon: 'error', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณากรอกข้อมูลที่จำเป็นในหน้านี้ให้ครบก่อน' }); return; } } showStep(index); }); stepperContainer.appendChild(stepElement); stepperItems.push(stepElement); }); }
function checkFirstPageCompletion() {
    const firstStep = formSteps[0];
    if (!firstStep || !stepperItems[0]) return false;
    const requiredInputs = firstStep.querySelectorAll('[required]');
    const allFilled = Array.from(requiredInputs).every(input => input.value.trim() !== '');
    stepperItems[0].classList.toggle('completed', allFilled);
    return allFilled;
}

// =================================================================
// == 5. MAIN EXECUTION (DOMContentLoaded) ==
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checklistForm');
    const saveLocalButton = document.getElementById('saveLocalButton');
    const exportCsvButton = document.getElementById('exportCsvButton');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    generateChecklistHTML();
    addSopChangeEventHandlers();
    setTodayDate();

    formSteps = Array.from(document.querySelectorAll('.form-step'));
    
    createStepper();
    showStep(0);

    prevBtn.addEventListener('click', () => { if (currentStep > 0) showStep(currentStep - 1); });
    
    nextBtn.addEventListener('click', () => {
        if (currentStep === 0) {
            if (!checkFirstPageCompletion()) {
                Swal.fire({
                    icon: 'error',
                    title: 'ข้อมูลไม่ครบถ้วน',
                    text: 'กรุณากรอกข้อมูลที่จำเป็น (ที่มีเครื่องหมาย *) ให้ครบถ้วนก่อนไปหน้าถัดไป'
                });
                const firstInvalid = formSteps[0].querySelector('[required]:invalid, [required]:placeholder-shown');
                if(firstInvalid) firstInvalid.focus();
                return;
            }
        }
        if (currentStep < formSteps.length - 1) {
            showStep(currentStep + 1);
        }
    });
    
    exportCsvButton.addEventListener('click', () => exportToCSV(form));
    saveLocalButton.addEventListener('click', () => saveLocalData(form));

    const statusBanner = document.getElementById('network-status-banner');
    if (statusBanner) {
        function updateNetworkStatus() {
            if (navigator.onLine) {
                statusBanner.textContent = '🟢 Online';
                statusBanner.classList.add('status-online');
                statusBanner.classList.remove('status-offline');
            } else {
                statusBanner.textContent = '⚪ Offline';
                statusBanner.classList.add('status-offline');
                statusBanner.classList.remove('status-online');
            }
        }
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        updateNetworkStatus();
    }
    
    formSteps.forEach((step, index) => {
        if (index === 0) return; 
        const container = step.querySelector('.completion-checkbox-container');
        if (container) {
            const checkboxId = `step-complete-${index}`;
            container.innerHTML = `<label for="${checkboxId}">Mark this page as complete</label><input type="checkbox" id="${checkboxId}" class="page-completion-checkbox" data-step-index="${index}">`;
        }
    });

    form.addEventListener('change', (e) => {
        if (e.target.classList.contains('page-completion-checkbox')) {
            const stepIndex = parseInt(e.target.dataset.stepIndex, 10);
            const stepperItem = stepperItems[stepIndex];
            if (stepperItem) {
                stepperItem.classList.toggle('completed', e.target.checked);
            }
        }
    });

    const firstStep = formSteps[0];
    if (firstStep) {
        firstStep.addEventListener('input', checkFirstPageCompletion);
    }

    const crewObservedInput = document.getElementById('crewObserved');
    if(crewObservedInput) {
        crewObservedInput.addEventListener('change', () => {
            if(parseInt(crewObservedInput.value, 10) < 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Number',
                    text: 'Number of Cabin Crew Observed cannot be negative.'
                });
                crewObservedInput.value = '';
            }
        });
    }

    loadLocalData(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!checkFirstPageCompletion()) {
            showStep(0);
            Swal.fire({
                icon: 'error',
                title: 'ข้อมูลไม่ครบถ้วน',
                text: `กรุณากรอกข้อมูลที่จำเป็นในหน้า Flight & Audit Details ให้ครบถ้วน`
            });
            const firstInvalid = formSteps[0].querySelector('[required]:invalid, [required]:placeholder-shown');
            if(firstInvalid) setTimeout(() => firstInvalid.focus(), 100);
            return;
        }

        const incompletePages = [];
        formSteps.forEach((step, index) => {
            if (index === 0) return;
            const checkbox = step.querySelector('.page-completion-checkbox');
            if (checkbox && !checkbox.checked) {
                const titleElement = step.querySelector('.step-title');
                const title = titleElement ? (titleElement.textContent.split('. ')[1] || titleElement.textContent) : `Page ${index + 1}`;
                incompletePages.push(title);
            }
        });

        if (incompletePages.length > 0) {
            Swal.fire({ icon: 'warning', title: 'Incomplete Sections', html: `Please complete the following sections before submitting:<br><br><b>${incompletePages.join('<br>')}</b>` });
            return;
        }

     Swal.fire({
    title: "Submitting...",
    text: "Please wait while we send data to the server.",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
});

const data = collectFormDataForSheets(form);

try {
    const response = await fetch("/api/losa_save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    Swal.close();

    if (result.success) {
        Swal.fire({
            icon: "success",
            title: "Submitted!",
            text: "Your report has been saved to Google Sheets."
        });

        // เคลียร์ draft
        localStorage.removeItem('losaDraft');
        form.reset();
        setTodayDate();

        document
            .querySelectorAll('.sop-fail-row, .sop-pass-row, .completed')
            .forEach(el =>
                el.classList.remove('sop-fail-row', 'sop-pass-row', 'completed')
            );

        document
            .querySelectorAll('.page-completion-checkbox')
            .forEach(cb => cb.checked = false);

        checkFirstPageCompletion();
        showStep(0);

    } else {
        Swal.fire({
            icon: "error",
            title: "Submission Failed",
            text: result.error || "Unknown server error."
        });
    }

} catch (error) {
    console.error("Server Submission Error:", error);
    Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Could not send data. Please check your network or server logs."
    });
}

    });
});