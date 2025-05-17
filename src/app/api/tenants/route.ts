import { createTenant } from "@/app/actions/tenants";
import { tenantRegistrationSchema } from "@/components/tenant-registration-form";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: Fetch all tenants
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tenants").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// POST: Create new tenant
export async function POST(req: Request) {
  const body = await req.json();
  const result = tenantRegistrationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid Tenant Data", details: result.error.flatten() },
      { status: 422 }
    );
  }
  const { name, subdomain } = body;
  try {
    await createTenant({ name, subdomain });
  } catch (error) {
    return NextResponse.json(
      { error: `Could not create new Tenant: ${error}` },
      { status: 500 }
    );
  }
}
