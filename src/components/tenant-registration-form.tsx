"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/shadcn/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { createTenant } from "@/app/actions/tenants";
import { toast } from "sonner";

// 👇 Define schema to match your `tenants.Insert` type
export const tenantRegistrationSchema = z.object({
  name: z.string().min(3),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(63, "Subdomain is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain must be lowercase alphanumeric or hyphens"
    ),
});

export type TenantRegistration = z.infer<typeof tenantRegistrationSchema>;

export function TenantRegistrationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<TenantRegistration>({
    resolver: zodResolver(tenantRegistrationSchema),
    defaultValues: {
      name: "",
      subdomain: "",
    },
  });

  async function onSubmit(values: TenantRegistration) {
    try {
      await createTenant(values);
      toast("Organization successfully created");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create a new Organization</CardTitle>
          <CardDescription>
            <p>Looks like you aren't assigned to an organization!</p>
            <p> You can create an organization here.</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization / Business Name</FormLabel>
                    <FormDescription>
                      This is your public business name.
                    </FormDescription>
                    <FormDescription>
                      This <strong>CAN</strong> be changed later.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomain</FormLabel>
                    <FormDescription>
                      This will be the URL you use to access your dashboard.
                    </FormDescription>
                    <FormDescription>
                      <em>e.g. acme-corp.tenanttemplate.com</em>
                    </FormDescription>
                    <FormDescription>
                      This <strong>CAN NOT</strong> be changed later.
                    </FormDescription>
                    <FormDescription></FormDescription>
                    <FormControl>
                      <Input placeholder="e.g. acme-corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Create Organization
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
