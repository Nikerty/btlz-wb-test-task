/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("tariffs", (table) => {
        table.increments("id").primary();
        table.string("warehouse_name").notNullable();
        table.decimal("box_delivery_base", 10, 2);
        table.decimal("box_delivery_liter", 10, 2);
        table.decimal("box_storage_base", 10, 2);
        table.decimal("box_storage_liter", 10, 2);
        table.string("dt_next_box");
        table.string("dt_till_box");
        table.integer("kgvp_percentage").notNullable();

        table.date("date").notNullable();

        table.unique(["warehouse_name", "date"]);

        table.timestamps(true, true);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("tariffs");
}
