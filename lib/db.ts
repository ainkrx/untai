import { drizzle } from "drizzle-orm/node-postgres";
import { authRelations } from "../auth-schema";

export const db = drizzle(process.env.DATABASE_URL!, { relations: authRelations });
