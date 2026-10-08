import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { 
        type: ["member", "admin"],
        required: true,
        defaultValue: "member",
        input: false
      },
      bio: {
        type: "string",
        required: false
      },
    },
  },
});
