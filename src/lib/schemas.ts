import { Database } from "./database.types";

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
