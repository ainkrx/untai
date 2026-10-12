import { drizzle } from "drizzle-orm/node-postgres";
import { appRelations } from "./schema/app";
import { authRelations } from "./schema/auth";

export const db = drizzle(process.env.DATABASE_URL!, {
  relations: {
    ...authRelations,
    ...appRelations,
    // both have a `user` entry, so using the auth entry and both relations
    user: { ...authRelations.user, relations: { ...authRelations.user.relations, ...appRelations.user.relations } },
  },
});
