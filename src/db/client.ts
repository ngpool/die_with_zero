import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, openDatabaseAsync } from "expo-sqlite";
import { Platform } from "react-native";

export let db: ExpoSQLiteDatabase;

// On web, openDatabaseSync requires SharedArrayBuffer (COOP/COEP headers),
// so we use openDatabaseAsync to avoid this restriction.
// We also avoid top-level await which isn't supported in all environments.
export async function initDb() {
    if (db) return db;

    const expoDb =
        Platform.OS === "web"
            ? await openDatabaseAsync("db.db")
            : openDatabaseSync("db.db");

    db = drizzle(expoDb);
    return db;
}
