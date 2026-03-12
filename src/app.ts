import "dotenv/config";
import knex from "knex";
import knexConfig from "#config/knex/knexfile.js";
import { GoogleSheetsService } from "./services/gs.service.js";
import type { WBTariff, Spreadsheet } from "#types/db.js";
import { WBService } from "#services/wb.service.js";
import { TariffService } from "#services/tariff.service.js";
import env from "#config/env/env.js";

const db = knex(knexConfig);

async function checkFirstSpreadsheet() {
    const existing = await db("spreadsheets").select("spreadsheet_id").limit(1);

    console.log(env);

    if (existing.length === 0 && env.INITIAL_SPREADSHEET_IDS) {
        // Парсим строку: "id1, id2 " -> ["id1", "id2"]
        const ids = env.INITIAL_SPREADSHEET_IDS.split(",")
            .map((id) => id.trim())
            .filter((id) => id.length > 0);

        if (ids.length > 0) {
            console.log(`Найдено ${ids.length} ID для инициализации. Добавляю в БД...`);

            const records = ids.map((id) => ({ spreadsheet_id: id }));

            await db("spreadsheets").insert(records);
            console.log("Таблицы успешно добавлены.");
        }
    }
}

async function main() {
    console.log("Запуск приложения...");

    try {
        await db.raw("SELECT 1");
        console.log("База данных подключена");

        const wb = new WBService();
        const gs = new GoogleSheetsService();
        const tariffs = new TariffService(db);

        await checkFirstSpreadsheet();

        // Запускаем джобу при инициализации
        await job(wb, gs, tariffs);

        // Потом каждый час
        setInterval(async () => {
            await job(wb, gs, tariffs);
        }, 3600000);
    } catch (error) {
        console.error("❌ Критическая ошибка при запуске:", error);
        process.exit(1);
    }
}

async function job(wb: WBService, gs: GoogleSheetsService, tariffs: TariffService) {
    console.log(`[${new Date().toISOString()}] Начинаю цикл обновления...`);

    try {
        const data = await wb.getTariffs();

        await tariffs.saveTariffs(data);

        const today = new Date().toISOString().split("T")[0];

        const actualData = await db<WBTariff>("tariffs").where("date", today).orderBy("box_delivery_base", "asc");

        const spreadsheets = await db<Spreadsheet>("spreadsheets").select("spreadsheet_id");

        for (const { spreadsheet_id } of spreadsheets) {
            await gs.updateSheet(spreadsheet_id, actualData);
        }
    } catch (error) {
        console.error("❌ Ошибка в цикле job:", (error as Error).message);
    }
}

main();
