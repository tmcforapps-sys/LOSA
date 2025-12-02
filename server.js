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
// อัปเดต Array ด้วย 216 Headers ที่คุณระบุมา และย้าย serverTimestamp มาไว้ด้านหน้า
const FIXED_HEADERS = [
    "serverTimestamp",        // 1. (A) Server Timestamp (สำหรับการตรวจสอบ)
    "observationDate",        // 2. (B)
    "flightNumber",           // 3. (C)
    "NewrouteFrom",           // 4. (D)
    "routeTo",                // 5. (E)
    "aircraftType",           // 6. (F)
    "observerId",             // 7. (G)
    "crewObserved",           // 8. (H)
    "loadFactor",             // 9. (I)
    "inspectorName",          // 10. (J)
    "A11_Narrative",          // 11. (K)
    "A12_Narrative",          // 12. (L)
    "A13_Narrative",          // 13. (M)
    "A14_Narrative",          // 14. (N)
    "A15_Narrative",          // 15. (O)
    "A16_Narrative",          // 16. (P)
    "A17_Narrative",          // 17. (Q)
    "A21_Narrative",          // 18. (R)
    "A22_Narrative",          // 19. (S)
    "A23_Narrative",          // 20. (T)
    "A24_Narrative",          // 21. (U)
    "A25_Narrative",          // 22. (V)
    "A31_Narrative",          // 23. (W)
    "A32_Narrative",          // 24. (X)
    "A33_Narrative",          // 25. (Y)
    "A34_Narrative",          // 26. (Z)
    "A35_Narrative",          // 27. (AA)
    "A36_Narrative",          // 28. (AB)
    "B11_Narrative",          // 29. (AC)
    "B12_Narrative",          // 30. (AD)
    "B13_Narrative",          // 31. (AE)
    "B14_Narrative",          // 32. (AF)
    "B15_Narrative",          // 33. (AG)
    "B21_Narrative",          // 34. (AH)
    "B22_Narrative",          // 35. (AI)
    "B23_Narrative",          // 36. (AJ)
    "B24_Narrative",          // 37. (AK)
    "B25_Narrative",          // 38. (AL)
    "B26_Narrative",          // 39. (AM)
    "B31_Narrative",          // 40. (AN)
    "B32_Narrative",          // 41. (AO)
    "C11_Narrative",          // 42. (AP)
    "C12_Narrative",          // 43. (AQ)
    "C13_Narrative",          // 44. (AR)
    "C14_Narrative",          // 45. (AS)
    "C21_Narrative",          // 46. (AT)
    "C22_Narrative",          // 47. (AU)
    "C23_Narrative",          // 48. (AV)
    "D11_Narrative",          // 49. (AW)
    "D12_Narrative",          // 50. (AX)
    "D21_Narrative",          // 51. (AY)
    "D22_Narrative",          // 52. (AZ)
    "D23_Narrative",          // 53. (BA)
    "D24_Narrative",          // 54. (BB)
    "D31_Narrative",          // 55. (BC)
    "D32_Narrative",          // 56. (BD)
    "D33_Narrative",          // 57. (BE)
    "D41_Narrative",          // 58. (BF)
    "D51_Narrative",          // 59. (BG)
    "D52_Narrative",          // 60. (BH)
    "E11_Narrative",          // 61. (BI)
    "E21_Narrative",          // 62. (BJ)
    "E22_Narrative",          // 63. (BK)
    "E23_Narrative",          // 64. (BL)
    "E24_Narrative",          // 65. (BM)
    "E3_Narrative",           // 66. (BN)
    "E41_Narrative",          // 67. (BO)
    "F11_Narrative",          // 68. (BP)
    "F12_Narrative",          // 69. (BQ)
    "F13_Narrative",          // 70. (BR)
    "F14_Narrative",          // 71. (BS)
    "F21_Narrative",          // 72. (BT)
    "F22_Narrative",          // 73. (BU)
    "F23_Narrative",          // 74. (BV)
    "F24_Narrative",          // 75. (BW)
    "F31_Narrative",          // 76. (BX)
    "F32_Narrative",          // 77. (BY)
    "F33_Narrative",          // 78. (BZ)
    "G11_Narrative",          // 79. (CA)
    "G12_Narrative",          // 80. (CB)
    "G13_Narrative",          // 81. (CC)
    "G21_Narrative",          // 82. (CD)
    // Summary Fields (จากส่วนที่ถูกรวม)
    "sigThreat",              // 83. (CE)
    "sigError",               // 84. (CF)
    "effectiveCm",            // 85. (CG)
    "generalComments",        // 86. (CH)
    "areasOfStrength",        // 87. (CI)
    "opportunitiesForImprovement", // 88. (CJ)
    "observerSignature",      // 89. (CK)
    "reportCompletionDate",   // 90. (CL)
    "submissionTimestamp",    // 91. (CM)
    "completedSteps",         // 92. (CN)
    "A36_E",                  // 93. (CO)
    "A36_U",                  // 94. (CP)
    "A36_C",                  // 95. (CQ)
    "A36_Narrative",          // 96. (CR)
    "B11_SOP",                // 97. (CS)
    "B11_T",                  // 98. (CT)
    "B11_E",                  // 99. (CU)
    "B11_U",                  // 100. (CV)
    "B11_C",                  // 101. (CW)
    "B11_Narrative",          // 102. (CX)
    "B12_SOP",                // 103. (CY)
    "B12_T",                  // 104. (CZ)
    "B12_E",                  // 105. (DA)
    "B12_U",                  // 106. (DB)
    "B12_C",                  // 107. (DC)
    "B12_Narrative",          // 108. (DD)
    "B13_SOP",                // 109. (DE)
    "B13_T",                  // 110. (DF)
    "B13_E",                  // 111. (DG)
    "B13_U",                  // 112. (DH)
    "B13_C",                  // 113. (DI)
    "B13_Narrative",          // 114. (DJ)
    "B14_SOP",                // 115. (DK)
    "B14_T",                  // 116. (DL)
    "B14_E",                  // 117. (DM)
    "B14_U",                  // 118. (DN)
    "B14_C",                  // 119. (DO)
    "B14_Narrative",          // 120. (DP)
    "B15_SOP",                // 121. (DQ)
    "B15_T",                  // 122. (DR)
    "B15_E",                  // 123. (DS)
    "B15_U",                  // 124. (DT)
    "B15_C",                  // 125. (DU)
    "B15_Narrative",          // 126. (DV)
    "B21_SOP",                // 127. (DW)
    "B21_T",                  // 128. (DX)
    "B21_E",                  // 129. (DY)
    "B21_U",                  // 130. (DZ)
    "B21_C",                  // 131. (EA)
    "B21_Narrative",          // 132. (EB)
    "B22_SOP",                // 133. (EC)
    "B22_T",                  // 134. (ED)
    "B22_E",                  // 135. (EE)
    "B22_U",                  // 136. (EF)
    "B22_C",                  // 137. (EG)
    "B22_Narrative",          // 138. (EH)
    "B23_SOP",                // 139. (EI)
    "B23_T",                  // 140. (EJ)
    "B23_E",                  // 141. (EK)
    "B23_U",                  // 142. (EL)
    "B23_C",                  // 143. (EM)
    "B23_Narrative",          // 144. (EN)
    "B24_SOP",                // 145. (EO)
    "B24_T",                  // 146. (EP)
    "B24_E",                  // 147. (EQ)
    "B24_U",                  // 148. (ER)
    "B24_C",                  // 149. (ES)
    "B24_Narrative",          // 150. (ET)
    "B25_SOP",                // 151. (EU)
    "B25_T",                  // 152. (EV)
    "B25_E",                  // 153. (EW)
    "B25_U",                  // 154. (EX)
    "B25_C",                  // 155. (EY)
    "B25_Narrative",          // 156. (EZ)
    "B26_SOP",                // 157. (FA)
    "B26_T",                  // 158. (FB)
    "B26_E",                  // 159. (FC)
    "B26_U",                  // 160. (FD)
    "B26_C",                  // 161. (FE)
    "B26_Narrative",          // 162. (FF)
    "B31_SOP",                // 163. (FG)
    "B31_T",                  // 164. (FH)
    "B31_E",                  // 165. (FI)
    "B31_U",                  // 166. (FJ)
    "B31_C",                  // 167. (FK)
    "B31_Narrative",          // 168. (FL)
    "B32_SOP",                // 169. (FM)
    "B32_T",                  // 170. (FN)
    "B32_E",                  // 171. (FO)
    "B32_U",                  // 172. (FP)
    "B32_C",                  // 173. (FQ)
    "B32_Narrative",          // 174. (FR)
    "C11_SOP",                // 175. (FS)
    "C11_T",                  // 176. (FT)
    "C11_E",                  // 177. (FU)
    "C11_U",                  // 178. (FV)
    "C11_C",                  // 179. (FW)
    "C11_Narrative",          // 180. (FX)
    "C12_SOP",                // 181. (FY)
    "C12_T",                  // 182. (FZ)
    "C12_E",                  // 183. (GA)
    "C12_U",                  // 184. (GB)
    "C12_C",                  // 185. (GC)
    "C12_Narrative",          // 186. (GD)
    "C13_SOP",                // 187. (GE)
    "C13_T",                  // 188. (GF)
    "C13_E",                  // 189. (GG)
    "C13_U",                  // 190. (GH)
    "C13_C",                  // 191. (GI)
    "C13_Narrative",          // 192. (GJ)
    "C14_SOP",                // 193. (GK)
    "C14_T",                  // 194. (GL)
    "C14_E",                  // 195. (GM)
    "C14_U",                  // 196. (GN)
    "C14_C",                  // 197. (GO)
    "C14_Narrative",          // 198. (GP)
    "C21_SOP",                // 199. (GQ)
    "C21_T",                  // 200. (GR)
    "C21_E",                  // 201. (GS)
    "C21_U",                  // 202. (GT)
    "C21_C",                  // 203. (GU)
    "C21_Narrative",          // 204. (GV)
    "C22_SOP",                // 205. (GW)
    "C22_T",                  // 206. (GX)
    "C22_E",                  // 207. (GY)
    "C22_U",                  // 208. (GZ)
    "C22_C",                  // 209. (HA)
    "C22_Narrative",          // 210. (HB)
    "C23_SOP",                // 211. (HC)
    "C23_T",                  // 212. (HD)
    "C23_E",                  // 213. (HE)
    "C23_U",                  // 214. (HF)
    "C23_C",                  // 215. (HG)
    "C23_Narrative",          // 216. (HH)
    // หมายเหตุ: โค้ดเดิมมีการตั้งค่า range A1:ZZ1 ซึ่งครอบคลุมถึงคอลัมน์ GH เรียบร้อยแล้ว
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
    // ขยายขอบเขตการอ่านจาก Z1 เป็น ZZ1 เพื่อรองรับคอลัมน์ GH (216 คอลัมน์)
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
