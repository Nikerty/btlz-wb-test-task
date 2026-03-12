import env from "#config/env/env.js";
import type { WBTariff } from "#types/db.js";

export class WBService {
    private apiUrl = "https://common-api.wildberries.ru/api/v1/tariffs/box";

    async getTariffs(): Promise<WBTariff[]> {
        const today = new Date().toISOString().split("T")[0];

        const response = await fetch(`${this.apiUrl}?date=${today}`, {
            headers: { "Authorization": `${env.WB_API_TOKEN}` },
        });

        if (!response.ok) throw new Error(`WB API error: ${response.statusText}`);

        const json = await response.json();

        const list = json.response.data.warehouseList;

        return list.map((item: any) => {
            const parseNum = (val: any) => {
                if (typeof val === "string") {
                    val = val.replace(",", ".");
                }
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed; // Если NaN — ставим 0
            };

            return {
                warehouse_name: item.warehouseName || "Неизвестный склад",
                box_delivery_base: parseNum(item.boxDeliveryBase),
                box_delivery_liter: parseNum(item.boxDeliveryLiter),
                box_storage_base: parseNum(item.boxStorageBase),
                box_storage_liter: parseNum(item.boxStorageLiter),
                dt_next_box: item.dtNextBox || null,
                dt_till_box: item.dtTillBox || null,
                kgvp_percentage: Math.round(parseNum(item.kgvpPercentage)),
                date: today,
            };
        });
    }
}
