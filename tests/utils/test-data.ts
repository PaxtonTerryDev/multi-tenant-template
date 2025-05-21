import { createUser } from "@/app/actions/users";
import {
  emailRegistration,
  RegistrationMethod,
  submitEmailRegistration,
} from "@/app/auth/auth-actions";
import { UserProfile } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { faker } from "@faker-js/faker";
import { AuthResponse } from "@supabase/supabase-js";

export class TestData {
  /**
   * Creates an authorized user.
   * @param method How the user is authorized.  Defaults to email
   *
   * NOTE - this creates an entry in the auth.users table. Do not call anywhere it could touch prod
   */
  public async user(): Promise<UserProfile | null> {
    var user: UserProfile | null = null;

    const supabase = await createClient(); // need to use the anon client to create users in auth table
    const pwd = faker.internet.password();
    const userData = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: pwd,
      confirmPassword: pwd,
    };

    const authData = await emailRegistration(userData, supabase);

    if (authData && authData.data.user) {
      const { data, error: insertError } = await createUser({
        id: authData.data.user?.id,
        ...userData,
      });

      if (data) user = data;

      if (insertError) {
        throw new Error("Error creating user profile.");
      }
    }
    return user;
  }
}
