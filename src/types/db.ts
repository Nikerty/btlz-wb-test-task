export interface WBTariff {
    id?: number;
    warehouse_name: string;
    box_delivery_base: number;
    box_delivery_liter: number;
    box_storage_base: number;
    box_storage_liter: number;
    dt_next_box: string | null;
    dt_till_box: string | null;
    kgvp_percentage: number;
    date: string;
}

export interface Spreadsheet {
    id?: number;
    spreadsheet_id: string;
    created_at?: string;
}
