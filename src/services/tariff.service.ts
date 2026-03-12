import { Knex } from "knex";
import type { WBTariff } from "#types/db.js";

export class TariffService {
    constructor(private db: Knex) {}

    async saveTariffs(tariffs: WBTariff[]) {
        const chunks = [];
        for (let i = 0; i < tariffs.length; i += 100) {
            chunks.push(tariffs.slice(i, i + 100));
        }

        for (const chunk of chunks) {
            await this.db("tariffs").insert(chunk).onConflict(["warehouse_name", "date"]).merge();
        }
        console.log(`✅ Данные успешно синхронизированы с БД (${tariffs.length} записей)`);
    }

    async getTodayTariffs() {
        const today = new Date().toISOString().split("T")[0];
        return this.db("tariffs").where("date", today).orderBy("box_delivery_base", "asc");
    }

    async getSpreadsheetIds(): Promise<string[]> {
        const rows = await this.db("spreadsheets").select("spreadsheet_id");
        return rows.map((r) => r.spreadsheet_id);
    }
}
