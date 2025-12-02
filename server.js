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

// ถ้าใช้ Vite → ต้องใช้ dist
app.use(express.static(path.join(__dirname, "dist")));

// ---------------- Google Sheets Setup ----------------
const SHEET_ID = process.env.SHEET_ID;
const SHEET_LOSA_DATA = "Sheet1";

let auth;
try {
    auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
} catch (e) {
    console.error("ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT", e);
}

let sheets;
async function initSheets() {
    const client = await auth.getClient();
    sheets = google.sheets({ version: "v4", auth: client });
}
initSheets();

/**
 * ตรวจสอบ header และเขียนใหม่ถ้าไม่ตรง
 */
async function ensureHeaders(spreadsheetId, sheetName, newHeaders) {
    const range = `${sheetName}!A1:Z1`;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const existing = response.data.values ? response.data.values[0] : [];

    // เปรียบเทียบ header ทั้งหมด
    if (existing.join("|") !== newHeaders.join("|")) {
        console.log(`Updating headers in ${sheetName}`);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: "RAW",
            requestBody: { values: [newHeaders] },
        });
    }
}

// ---------------- API Save ----------------
app.post("/api/losa_save", async (req, res) => {
    const rawData = req.body;
    rawData.serverTimestamp = new Date().toISOString();

    try {
        if (!SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT) {
            throw new Error("Missing environment variables.");
        }

        const headers = Object.keys(rawData);
        const values = Object.values(rawData);

        await ensureHeaders(SHEET_ID, SHEET_LOSA_DATA, headers);

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: SHEET_LOSA_DATA,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [values] },
        });

        res.json({ success: true, message: "Saved to sheet." });

    } catch (err) {
        console.error("SAVE ERROR:", err);
        res.status(500).json({
            error: "Failed to save.",
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
