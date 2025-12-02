import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

// ---------------- Path config ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- Express Setup ----------------
const app = express();
// ตั้งค่าลิมิตให้รองรับข้อมูลขนาดใหญ่ (เช่น รูปภาพ base64) หากมี
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ถ้าใช้ Vite → ต้องใช้ dist (สำหรับ Static Files)
app.use(express.static(path.join(__dirname, "dist")));

// ---------------- Google Sheets Setup ----------------
const SHEET_ID = process.env.SHEET_ID;
// ชื่อชีทที่ต้องการบันทึกข้อมูล
const SHEET_LOSA_DATA = "Sheet1";

// ---------------- FIXED SCHEMA DEFINITION (กำหนดลำดับ Column ที่แน่นอน) ----------------
// อัปเดต Array ด้วย 219 Headers ตามลำดับใหม่ที่คุณระบุ (รวม serverTimestamp)
const FIXED_HEADERS = [
    // Server Control Field
    "serverTimestamp",          // 1. (A) Server Timestamp (สำหรับการตรวจสอบ)
    // Core Report Info
    "submissionTimestamp",      // 2. (B)
    "observationDate",          // 3. (C)
    "flightNumber",             // 4. (D)
    "inspectorName",         // 5. (E)
    "routeFrom",                // 6. (F)
    "routeTo",                  // 7. (G)
    "aircraftType",             // 8. (H)
    "observerId",               // 9. (I)
    "crewObserved",             // 10. (J)
    "loadFactor",               // 11. (K)
    // Section A1: Cockpit Preparation (7 items * 6 fields = 42)
    "A11_SOP", "A11_T", "A11_E", "A11_U", "A11_C", "A11_Narrative", 
    "A12_SOP", "A12_T", "A12_E", "A12_U", "A12_C", "A12_Narrative", 
    "A13_SOP", "A13_T", "A13_E", "A13_U", "A13_C", "A13_Narrative", 
    "A14_SOP", "A14_T", "A14_E", "A14_U", "A14_C", "A14_Narrative", 
    "A15_SOP", "A15_T", "A15_E", "A15_U", "A15_C", "A15_Narrative", 
    "A16_SOP", "A16_T", "A16_E", "A16_U", "A16_C", "A16_Narrative", 
    "A17_SOP", "A17_T", "A17_E", "A17_U", "A17_C", "A17_Narrative",
    // Section A2: Take-off Preparation (5 items * 6 fields = 30)
    "A21_SOP", "A21_T", "A21_E", "A21_U", "A21_C", "A21_Narrative",
    "A22_SOP", "A22_T", "A22_E", "A22_U", "A22_C", "A22_Narrative",
    "A23_SOP", "A23_T", "A23_E", "A23_U", "A23_C", "A23_Narrative",
    "A24_SOP", "A24_T", "A24_E", "A24_U", "A24_C", "A24_Narrative",
    "A25_SOP", "A25_T", "A25_E", "A25_U", "A25_C", "A25_Narrative",
    // Section A3: Pushback/Taxi (6 items * 6 fields = 36)
    "A31_SOP", "A31_T", "A31_E", "A31_U", "A31_C", "A31_Narrative",
    "A32_SOP", "A32_T", "A32_E", "A32_U", "A32_C", "A32_Narrative",
    "A33_SOP", "A33_T", "A33_E", "A33_U", "A33_C", "A33_Narrative",
    "A34_SOP", "A34_T", "A34_E", "A34_U", "A34_C", "A34_Narrative",
    "A35_SOP", "A35_T", "A35_E", "A35_U", "A35_C", "A35_Narrative",
    "A36_SOP", "A36_T", "A36_E", "A36_U", "A36_C", "A36_Narrative",
    // Section B1: Take-off/Initial Climb (5 items * 6 fields = 30)
    "B11_SOP", "B11_T", "B11_E", "B11_U", "B11_C", "B11_Narrative",
    "B12_SOP", "B12_T", "B12_E", "B12_U", "B12_C", "B12_Narrative",
    "B13_SOP", "B13_T", "B13_E", "B13_U", "B13_C", "B13_Narrative",
    "B14_SOP", "B14_T", "B14_E", "B14_U", "B14_C", "B14_Narrative",
    "B15_SOP", "B15_T", "B15_E", "B15_U", "B15_C", "B15_Narrative",
    // Section B2: Climb/Cruise/Descent (6 items * 6 fields = 36)
    "B21_SOP", "B21_T", "B21_E", "B21_U", "B21_C", "B21_Narrative",
    "B22_SOP", "B22_T", "B22_E", "B22_U", "B22_C", "B22_Narrative",
    "B23_SOP", "B23_T", "B23_E", "B23_U", "B23_C", "B23_Narrative",
    "B24_SOP", "B24_T", "B24_E", "B24_U", "B24_C", "B24_Narrative",
    "B25_SOP", "B25_T", "B25_E", "B25_U", "B25_C", "B25_Narrative",
    "B26_SOP", "B26_T", "B26_E", "B26_U", "B26_C", "B26_Narrative",
    // Section B3: Approach Preparation (2 items * 6 fields = 12)
    "B31_SOP", "B31_T", "B31_E", "B31_U", "B31_C", "B31_Narrative",
    "B32_SOP", "B32_T", "B32_E", "B32_U", "B32_C", "B32_Narrative",
    // Section C1: Terminal Manoeuvring (4 items * 6 fields = 24)
    "C11_SOP", "C11_T", "C11_E", "C11_U", "C11_C", "C11_Narrative",
    "C12_SOP", "C12_T", "C12_E", "C12_U", "C12_C", "C12_Narrative",
    "C13_SOP", "C13_T", "C13_E", "C13_U", "C13_C", "C13_Narrative",
    "C14_SOP", "C14_T", "C14_E", "C14_U", "C14_C", "C14_Narrative",
    // Section C2: Landing/Rollout (3 items * 6 fields = 18)
    "C21_SOP", "C21_T", "C21_E", "C21_U", "C21_C", "C21_Narrative",
    "C22_SOP", "C22_T", "C22_E", "C22_U", "C22_C", "C22_Narrative",
    "C23_SOP", "C23_T", "C23_E", "C23_U", "C23_C", "C23_Narrative",
    // Section D1: Planning (2 items * 6 fields = 12)
    "D11_SOP", "D11_T", "D11_E", "D11_U", "D11_C", "D11_Narrative",
    "D12_SOP", "D12_T", "D12_E", "D12_U", "D12_C", "D12_Narrative",
    // Section D2: Execution (4 items * 6 fields = 24)
    "D21_SOP", "D21_T", "D21_E", "D21_U", "D21_C", "D21_Narrative",
    "D22_SOP", "D22_T", "D22_E", "D22_U", "D22_C", "D22_Narrative",
    "D23_SOP", "D23_T", "D23_E", "D23_U", "D23_C", "D23_Narrative",
    "D24_SOP", "D24_T", "D24_E", "D24_U", "D24_C", "D24_Narrative",
    // Section D3: Review (3 items * 6 fields = 18)
    "D31_SOP", "D31_T", "D31_E", "D31_U", "D31_C", "D31_Narrative",
    "D32_SOP", "D32_T", "D32_E", "D32_U", "D32_C", "D32_Narrative",
    "D33_SOP", "D33_T", "D33_E", "D33_U", "D33_C", "D33_Narrative",
    // Section D4: Workload Management (1 item * 6 fields = 6)
    "D41_SOP", "D41_T", "D41_E", "D41_U", "D41_C", "D41_Narrative",
    // Section D5: Automation Management (2 items * 6 fields = 12)
    "D51_SOP", "D51_T", "D51_E", "D51_U", "D51_C", "D51_Narrative",
    "D52_SOP", "D52_T", "D52_E", "D52_U", "D52_C", "D52_Narrative",
    // Section E1: Leadership (1 item * 6 fields = 6)
    "E11_SOP", "E11_T", "E11_E", "E11_U", "E11_C", "E11_Narrative",
    // Section E2: Monitoring (4 items * 6 fields = 24)
    "E21_SOP", "E21_T", "E21_E", "E21_U", "E21_C", "E21_Narrative",
    "E22_SOP", "E22_T", "E22_E", "E22_U", "E22_C", "E22_Narrative",
    "E23_SOP", "E23_T", "E23_E", "E23_U", "E23_C", "E23_Narrative",
    "E24_SOP", "E24_T", "E24_E", "E24_U", "E24_C", "E24_Narrative",
    // Section E3: Briefings/Communication (1 item * 6 fields = 6)
    "E3_SOP", "E3_T", "E3_E", "E3_U", "E3_C", "E3_Narrative",
    // Section E4: Contingency Planning (1 item * 6 fields = 6)
    "E41_SOP", "E41_T", "E41_E", "E41_U", "E41_C", "E41_Narrative",
    // Section F1: Callouts/Checklist (4 items * 6 fields = 24)
    "F11_SOP", "F11_T", "F11_E", "F11_U", "F11_C", "F11_Narrative",
    "F12_SOP", "F12_T", "F12_E", "F12_U", "F12_C", "F12_Narrative",
    "F13_SOP", "F13_T", "F13_E", "F13_U", "F13_C", "F13_Narrative",
    "F14_SOP", "F14_T", "F14_E", "F14_U", "F14_C", "F14_Narrative",
    // Section F2: Callouts/Checklist (4 items * 6 fields = 24)
    "F21_SOP", "F21_T", "F21_E", "F21_U", "F21_C", "F21_Narrative",
    "F22_SOP", "F22_T", "F22_E", "F22_U", "F22_C", "F22_Narrative",
    "F23_SOP", "F23_T", "F23_E", "F23_U", "F23_C", "F23_Narrative",
    "F24_SOP", "F24_T", "F24_E", "F24_U", "F24_C", "F24_Narrative",
    // Section F3: Communication with ATC/Dispatch (3 items * 6 fields = 18)
    "F31_SOP", "F31_T", "F31_E", "F31_U", "F31_C", "F31_Narrative",
    "F32_SOP", "F32_T", "F32_E", "F32_U", "F32_C", "F32_Narrative",
    "F33_SOP", "F33_T", "F33_E", "F33_U", "F33_C", "F33_Narrative",
    // Section G1: SOP/Rules Compliance (3 items * 6 fields = 18)
    "G11_SOP", "G11_T", "G11_E", "G11_U", "G11_C", "G11_Narrative",
    "G12_SOP", "G12_T", "G12_E", "G12_U", "G12_C", "G12_Narrative",
    "G13_SOP", "G13_T", "G13_E", "G13_U", "G13_C", "G13_Narrative",
    // Section G2: Non-Compliance (1 item * 6 fields = 6)
    "G21_SOP", "G21_T", "G21_E", "G21_U", "G21_C", "G21_Narrative",
    // Summary/Comments Fields
    "sigThreat", 
    "sigError", 
    "effectiveCm", 
    "generalComments", 
    "areasOfStrength", 
    "opportunitiesForImprovement", 
    "observerSignature", 
    "reportCompletionDate"
];


let auth;
try {
    // ใช้ JSON.parse เพื่อแปลง Service Account Key จาก Environment Variable
    auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
} catch (e) {
    // เพิ่มข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาดในการ Parsing
    console.error("ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT. ตรวจสอบว่าคีย์เป็น JSON ที่ถูกต้อง", e);
}

let sheets;
async function initSheets() {
    try {
        const client = await auth.getClient();
        sheets = google.sheets({ version: "v4", auth: client });
        console.log("✅ Google Sheets client initialized successfully.");
    } catch (e) {
        console.error("ERROR: Failed to initialize Google Sheets client.", e);
    }
}
initSheets();

/**
 * ตรวจสอบ header และเขียนใหม่ถ้าไม่ตรง (ใช้ FIXED_HEADERS เพื่อให้ลำดับคงที่)
 */
async function ensureHeaders(spreadsheetId, sheetName, newHeaders) {
    // ขยายขอบเขตการอ่านให้ครอบคลุมจำนวนคอลัมน์ใหม่ (ประมาณ 219 คอลัมน์)
    // ใช้ช่วงที่กว้างมาก (A1:ZZ1) เพื่อครอบคลุมคอลัมน์ทั้งหมดโดยไม่ต้องนับ
    const range = `${sheetName}!A1:ZZ1`; 

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    // ถ้าไม่มีค่าอยู่เลย หรือค่าที่อ่านมาไม่ตรงกับ FIXED_HEADERS ให้เขียนใหม่
    const existing = response.data.values ? response.data.values[0] : [];

    // เปรียบเทียบ header ทั้งหมด (ใช้ JSON.stringify เพื่อเทียบ Array)
    if (JSON.stringify(existing) !== JSON.stringify(newHeaders)) {
        console.log(`Updating headers in ${sheetName} to ensure correct order.`);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            // อัปเดตที่ A1 เพื่อให้เขียนทับ Headers เดิม
            range: `${sheetName}!A1`, 
            valueInputOption: "RAW",
            // ใช้ newHeaders ที่มาจาก FIXED_HEADERS เสมอ
            requestBody: { values: [newHeaders] }, 
        });
    }
}

// ---------------- API Save ----------------
app.post("/api/losa_save", async (req, res) => {
    // rawData คือข้อมูลที่มาจาก Frontend
    const rawData = req.body;
    // เพิ่ม Server Timestamp เสมอ
    rawData.serverTimestamp = new Date().toISOString();

    try {
        if (!SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT) {
            throw new Error("Missing environment variables (SHEET_ID or GOOGLE_SERVICE_ACCOUNT).");
        }
        
        // 1. ตรวจสอบและแก้ไข Headers โดยใช้ลำดับที่กำหนดตายตัว
        // จะมีการเขียน Header แถวแรกใหม่ หากลำดับไม่ตรงกับ FIXED_HEADERS
        await ensureHeaders(SHEET_ID, SHEET_LOSA_DATA, FIXED_HEADERS);
        
        // 2. สร้าง Array ของ Values ตามลำดับ Column ที่กำหนดไว้ใน FIXED_HEADERS เท่านั้น
        const orderedValues = FIXED_HEADERS.map(header => {
            // ใช้ค่าจาก rawData ถ้ามี ถ้าไม่มีให้ใช้สตริงว่าง ("")
            // ใช้ String() เพื่อให้แน่ใจว่าเป็นค่าที่ Sheets API รับได้ (ป้องกัน null/undefined)
            return rawData[header] !== undefined && rawData[header] !== null 
                   ? String(rawData[header]) 
                   : "";
        });

        // 3. Append ข้อมูล
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: SHEET_LOSA_DATA,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [orderedValues] }, // ใช้ค่าที่ถูกเรียงลำดับแล้ว
        });

        res.json({ success: true, message: "Saved to sheet successfully." });

    } catch (err) {
        // หากเกิดข้อผิดพลาดในการบันทึก
        console.error("SAVE ERROR:", err); 
        res.status(500).json({
            error: "Failed to save data to Google Sheets.",
            details: err.message,
        });
    }
});

// ---------------- SPA Fallback ----------------
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

