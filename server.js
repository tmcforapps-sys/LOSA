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
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, "dist")));

// ---------------- Google Sheets Setup ----------------
const SHEET_ID = process.env.SHEET_ID;
const SHEET_LOSA_DATA = "Sheet1";

// ---------------- FIXED SCHEMA DEFINITION ----------------
const FIXED_HEADERS = [
    "serverTimestamp", "submissionTimestamp", "observationDate", "flightNumberNew",
    "inspectorName", "routeFrom", "routeTo", "aircraftType", "observerId", "crewObserved", "loadFactor",
    "A11_SOP", "A11_T", "A11_E", "A11_U", "A11_C", "A11_Narrative", 
    "A12_SOP", "A12_T", "A12_E", "A12_U", "A12_C", "A12_Narrative", 
    "A13_SOP", "A13_T", "A13_E", "A13_U", "A13_C", "A13_Narrative", 
    "A14_SOP", "A14_T", "A14_E", "A14_U", "A14_C", "A14_Narrative", 
    "A15_SOP", "A15_T", "A15_E", "A15_U", "A15_C", "A15_Narrative", 
    "A16_SOP", "A16_T", "A16_E", "A16_U", "A16_C", "A16_Narrative", 
    "A17_SOP", "A17_T", "A17_E", "A17_U", "A17_C", "A17_Narrative",
    "A21_SOP", "A21_T", "A21_E", "A21_U", "A21_C", "A21_Narrative",
    "A22_SOP", "A22_T", "A22_E", "A22_U", "A22_C", "A22_Narrative",
    "A23_SOP", "A23_T", "A23_E", "A23_U", "A23_C", "A23_Narrative",
    "A24_SOP", "A24_T", "A24_E", "A24_U", "A24_C", "A24_Narrative",
    "A25_SOP", "A25_T", "A25_E", "A25_U", "A25_C", "A25_Narrative",
    "A31_SOP", "A31_T", "A31_E", "A31_U", "A31_C", "A31_Narrative",
    "A32_SOP", "A32_T", "A32_E", "A32_U", "A32_C", "A32_Narrative",
    "A33_SOP", "A33_T", "A33_E", "A33_U", "A33_C", "A33_Narrative",
    "A34_SOP", "A34_T", "A34_E", "A34_U", "A34_C", "A34_Narrative",
    "A35_SOP", "A35_T", "A35_E", "A35_U", "A35_C", "A35_Narrative",
    "A36_SOP", "A36_T", "A36_E", "A36_U", "A36_C", "A36_Narrative",
    "B11_SOP", "B11_T", "B11_E", "B11_U", "B11_C", "B11_Narrative",
    "B12_SOP", "B12_T", "B12_E", "B12_U", "B12_C", "B12_Narrative",
    "B13_SOP", "B13_T", "B13_E", "B13_U", "B13_C", "B13_Narrative",
    "B14_SOP", "B14_T", "B14_E", "B14_U", "B14_C", "B14_Narrative",
    "B15_SOP", "B15_T", "B15_E", "B15_U", "B15_C", "B15_Narrative",
    "B21_SOP", "B21_T", "B21_E", "B21_U", "B21_C", "B21_Narrative",
    "B22_SOP", "B22_T", "B22_E", "B22_U", "B22_C", "B22_Narrative",
    "B23_SOP", "B23_T", "B23_E", "B23_U", "B23_C", "B23_Narrative",
    "B24_SOP", "B24_T", "B24_E", "B24_U", "B24_C", "B24_Narrative",
    "B25_SOP", "B25_T", "B25_E", "B25_U", "B25_C", "B25_Narrative",
    "B26_SOP", "B26_T", "B26_E", "B26_U", "B26_C", "B26_Narrative",
    "B31_SOP", "B31_T", "B31_E", "B31_U", "B31_C", "B31_Narrative",
    "B32_SOP", "B32_T", "B32_E", "B32_U", "B32_C", "B32_Narrative",
    "C11_SOP", "C11_T", "C11_E", "C11_U", "C11_C", "C11_Narrative",
    "C12_SOP", "C12_T", "C12_E", "C12_U", "C12_C", "C12_Narrative",
    "C13_SOP", "C13_T", "C13_E", "C13_U", "C13_C", "C13_Narrative",
    "C14_SOP", "C14_T", "C14_E", "C14_U", "C14_C", "C14_Narrative",
    "C21_SOP", "C21_T", "C21_E", "C21_U", "C21_C", "C21_Narrative",
    "C22_SOP", "C22_T", "C22_E", "C22_U", "C22_C", "C22_Narrative",
    "C23_SOP", "C23_T", "C23_E", "C23_U", "C23_C", "C23_Narrative",
    "D11_SOP", "D11_T", "D11_E", "D11_U", "D11_C", "D11_Narrative",
    "D12_SOP", "D12_T", "D12_E", "D12_U", "D12_C", "D12_Narrative",
    "D21_SOP", "D21_T", "D21_E", "D21_U", "D21_C", "D21_Narrative",
    "D22_SOP", "D22_T", "D22_E", "D22_U", "D22_C", "D22_Narrative",
    "D23_SOP", "D23_T", "D23_E", "D23_U", "D23_C", "D23_Narrative",
    "D24_SOP", "D24_T", "D24_E", "D24_U", "D24_C", "D24_Narrative",
    "D31_SOP", "D31_T", "D31_E", "D31_U", "D31_C", "D31_Narrative",
    "D32_SOP", "D32_T", "D32_E", "D32_U", "D32_C", "D32_Narrative",
    "D33_SOP", "D33_T", "D33_E", "D33_U", "D33_C", "D33_Narrative",
    "D41_SOP", "D41_T", "D41_E", "D41_U", "D41_C", "D41_Narrative",
    "D51_SOP", "D51_T", "D51_E", "D51_U", "D51_C", "D51_Narrative",
    "D52_SOP", "D52_T", "D52_E", "D52_U", "D52_C", "D52_Narrative",
    "E11_SOP", "E11_T", "E11_E", "E11_U", "E11_C", "E11_Narrative",
    "E21_SOP", "E21_T", "E21_E", "E21_U", "E21_C", "E21_Narrative",
    "E22_SOP", "E22_T", "E22_E", "E22_U", "E22_C", "E22_Narrative",
    "E23_SOP", "E23_T", "E23_E", "E23_U", "E23_C", "E23_Narrative",
    "E24_SOP", "E24_T", "E24_E", "E24_U", "E24_C", "E24_Narrative",
    "E3_SOP", "E3_T", "E3_E", "E3_U", "E3_C", "E3_Narrative",
    "E41_SOP", "E41_T", "E41_E", "E41_U", "E41_C", "E41_Narrative",
    "E42_SOP", "E42_T", "E42_E", "E42_U", "E42_C", "E42_Narrative",
    "F11_SOP", "F11_T", "F11_E", "F11_U", "F11_C", "F11_Narrative",
    "F12_SOP", "F12_T", "F12_E", "F12_U", "F12_C", "F12_Narrative",
    "F13_SOP", "F13_T", "F13_E", "F13_U", "F13_C", "F13_Narrative",
    "F14_SOP", "F14_T", "F14_E", "F14_U", "F14_C", "F14_Narrative",
    "F21_SOP", "F21_T", "F21_E", "F21_U", "F21_C", "F21_Narrative",
    "F22_SOP", "F22_T", "F22_E", "F22_U", "F22_C", "F22_Narrative",
    "F23_SOP", "F23_T", "F23_E", "F23_U", "F23_C", "F23_Narrative",
    "F24_SOP", "F24_T", "F24_E", "F24_U", "F24_C", "F24_Narrative",
    "F31_SOP", "F31_T", "F31_E", "F31_U", "F31_C", "F31_Narrative",
    "F32_SOP", "F32_T", "F32_E", "F32_U", "F32_C", "F32_Narrative",
    "F33_SOP", "F33_T", "F33_E", "F33_U", "F33_C", "F33_Narrative",
    "G11_SOP", "G11_T", "G11_E", "G11_U", "G11_C", "G11_Narrative",
    "G12_SOP", "G12_T", "G12_E", "G12_U", "G12_C", "G12_Narrative",
    "G13_SOP", "G13_T", "G13_E", "G13_U", "G13_C", "G13_Narrative",
    "G21_SOP", "G21_T", "G21_E", "G21_U", "G21_C", "G21_Narrative",
    "sigThreat", "sigError", "effectiveCm", "generalComments", 
    "areasOfStrength", "opportunitiesForImprovement", "observerSignature", "reportCompletionDate"
];

let auth;
try {
    auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
} catch (e) {
    console.error("ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT.", e);
}

let sheets;
async function initSheets() {
    try {
        const client = await auth.getClient();
        sheets = google.sheets({ version: "v4", auth: client });
        console.log("✅ Google Sheets initialized.");
        // สร้าง Header แถวแรกทันทีที่รันโปรแกรม ถ้ายังไม่มีหรือลำดับไม่ตรง
        await ensureHeaders(SHEET_ID, SHEET_LOSA_DATA, FIXED_HEADERS);
    } catch (e) {
        console.error("ERROR: Failed to initialize Google Sheets.", e);
    }
}
initSheets();

async function ensureHeaders(spreadsheetId, sheetName, newHeaders) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A1:ZZ1`,
        });
        const existing = response.data.values ? response.data.values[0] : [];
        if (JSON.stringify(existing) !== JSON.stringify(newHeaders)) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: "RAW",
                requestBody: { values: [newHeaders] },
            });
        }
    } catch (err) {
        console.warn("Notice: Header check failed (likely new sheet).", err.message);
    }
}

// ---------------- API Save ----------------
app.post("/api/losa_save", async (req, res) => {
    const rawData = req.body;

    // --- แก้ไข FORMAT วันที่ให้ Google Sheets อ่านออก ---
    const now = new Date();
    // 'sv-SE' จะได้ Format YYYY-MM-DD HH:mm:ss ซึ่ง Sheets ยอมรับว่าเป็น Date ทันที
    const thaiTimeString = now.toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" });
    rawData.serverTimestamp = thaiTimeString;

    try {
        if (!SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT) {
            throw new Error("Environment variables SHEET_ID or GOOGLE_SERVICE_ACCOUNT are missing.");
        }

        const orderedValues = FIXED_HEADERS.map(header => {
            const val = rawData[header];
            return (val !== undefined && val !== null) ? String(val) : "";
        });

        // บันทึกข้อมูลแบบต่อท้าย (Append)
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_LOSA_DATA}!A1`, // ใส่ A1 เพื่อให้ API หาแถวว่างแถวแรกเอง
            valueInputOption: "USER_ENTERED", // สำคัญมาก: เพื่อให้ Sheets เปลี่ยน String วันที่เป็น Date Type
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [orderedValues],
            },
        });

        res.json({ success: true, message: "Data appended with proper date format." });
    } catch (err) {
        console.error("SAVE ERROR:", err);
        res.status(500).json({ error: err.message });
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
