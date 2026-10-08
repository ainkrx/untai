import { drizzle } from "drizzle-orm/neon-http";
import { authRelations } from "../auth-schema";

export const db = drizzle(process.env.DATABASE_URL!, { relations: authRelations });
