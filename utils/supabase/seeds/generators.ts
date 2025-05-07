import { faker } from "@faker-js/faker";
import { Database } from "@/lib/types/database.types";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

type TableName = keyof Database["public"]["Tables"];

// Strategy type
type SeedStrategy = (
  supabase: ReturnType<typeof createClient>
) => Promise<void>;

export class DataGenerator {
  private anon = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private service = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  private strategies: Record<TableName, () => Promise<void>> = {
    Tenants: this.seedTenants.bind(this),
    Profiles: this.seedProfiles.bind(this),
  };

  public async generate<T extends TableName>(table: T): Promise<void> {
    const strategy = this.strategies[table];
    if (!strategy) {
      throw new Error(`No generation strategy defined for table: ${table}`);
    }
    await strategy();
  }

  // Example strategy function for Tenants
  private async seedTenants(): Promise<void> {
    const tenant = { subdomain: faker.internet.domainWord() };

    const { data, error } = await this.anon
      .from("Tenants")
      .insert([tenant])
      .select();

    if (error) {
      console.error("Error seeding tenants:", error);
    } else {
      console.log("Seeded tenants:", data);
    }
  }

  private async seedProfiles(): Promise<void> {
    const profile = {
      first_name: faker.person.firstName(),
      middle_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.string.uuid(),
    };

    const { data: authData, error: authError } = await this.service.auth.signUp(
      {
        email: profile.email,
        password: profile.password,
      }
    );

    if (authError || !authData.user?.id) {
      console.error("Auth signUp failed:", authError);
      throw authError ?? new Error("No user returned from signUp");
    }

    // const { data: profileData, error: profileError } = await this.service
    //   .from("Profiles")
    //   .insert([
    //     {
    //       id: authData.user.id,
    //       first_name: profile.first_name,
    //       middle_name: profile.middle_name,
    //       last_name: profile.last_name,
    //       email: profile.email,
    //     },
    //   ])
    //   .select();

    // if (profileError) {
    //   console.error("Profile insert failed:", profileError);
    //   throw profileError;
    // }

    // console.log("Created user profile:", profileData);
  }
}

(async () => {
  const generator = new DataGenerator();
  await generator.generate("Profiles");
})();
