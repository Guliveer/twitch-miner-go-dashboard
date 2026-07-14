import { createClient } from "@supabase/supabase-js";
import { createInterface } from "readline";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

console.log("");
console.log("=== Twitch Miner Dashboard — First Admin Setup ===");
console.log("");

const email = await ask("Email: ");
const name = await ask("Display name: ");
const password = await ask("Password (min 8 chars): ");
console.log("");

console.log("Creating auth account...");
const { data: userData, error: authError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: name },
});

if (authError) {
  console.error("ERROR:", authError.message);
  process.exit(1);
}

console.log("Auth account created. User ID:", userData.user.id);

console.log("Inserting admin role into database...");
const { error: metaError } = await supabase
  .from("user_meta")
  .upsert(
    { user_id: userData.user.id, must_change_password: false, role: "admin" },
    { onConflict: "user_id" }
  );

if (metaError) {
  console.error("ERROR inserting user_meta:", metaError.message);
  process.exit(1);
}

console.log("");
console.log("Done! You can now log in at /login with:");
console.log("  Email:", email);
console.log("");
console.log("Remember to disable sign-up in Supabase Dashboard → Authentication → Providers → Email after this.");

rl.close();
