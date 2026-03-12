import { google } from "googleapis";
import type { WBTariff } from "#types/db.js";

export class GoogleSheetsService {
    private sheets;

    constructor() {
        const auth = new google.auth.JWT(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, undefined, process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), [
            "https://www.googleapis.com/auth/spreadsheets",
        ]);

        this.sheets = google.sheets({ version: "v4", auth });
    }

    async updateSheet(spreadsheetId: string, data: WBTariff[]) {
        try {
            const sheetName = "stocks_coefs";

            const rows = [
                ["Склад", "Коэффициент (%)", "Доставка (база)", "Доставка (литр)", "Хранение (база)", "Хранение (литр)", "Дата обновления"],
                ...data.map((item) => [
                    item.warehouse_name,
                    item.kgvp_percentage,
                    item.box_delivery_base,
                    item.box_delivery_liter,
                    item.box_storage_base,
                    item.box_storage_liter,
                    item.dt_next_box || "—",
                ]),
            ];

            await this.sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: `${sheetName}!A1:G1000`,
            });

            await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: rows,
                },
            });

            console.log(`📊 Таблица ${spreadsheetId} успешно обновлена. Записано строк: ${rows.length}`);
        } catch (error) {
            console.error(`❌ Ошибка обновления таблицы ${spreadsheetId}:`, error);
        }
    }
}
