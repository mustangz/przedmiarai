import { Resend } from "resend";
import fs from "fs";
import path from "path";

// ── Config ──────────────────────────────────────────────────
const FROM = "Marcin z PrzedmiarAI <kontakt@przedmiarai.pl>";
const REPLY_TO = "kontakt@przedmiarai.pl";
const SUBJECT = "Robimy przedmiary 10x szybciej — szukamy beta testerów";
const DELAY_MS = 1500; // 1.5s between emails

// ── Types ───────────────────────────────────────────────────
interface Contact {
  email: string;
  name: string;
  firma: string;
  kategoria: string;
}

// ── Helpers ─────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function personalize(template: string, contact: Contact): string {
  const greeting = contact.name ? ` ${contact.name}` : "";
  return template
    .replace(/\{\{greeting\}\}/g, greeting)
    .replace(/\{\{name\}\}/g, contact.name || "")
    .replace(/\{\{firma\}\}/g, contact.firma)
    .replace(/\{\{email\}\}/g, contact.email);
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const testEmail = args.find((a) => a.startsWith("--test="))?.split("=")[1];
  const filterCategory = args.find((a) => a.startsWith("--kategoria="))?.split("=")[1];

  // Load contacts & template
  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
  const contacts: Contact[] = JSON.parse(
    fs.readFileSync(path.join(scriptsDir, "contacts.json"), "utf-8")
  );
  const template = fs.readFileSync(
    path.join(scriptsDir, "campaign-template.html"),
    "utf-8"
  );

  // Filter
  let targets = contacts;
  if (testEmail) {
    targets = [{ email: testEmail, name: "Marcin", firma: "TestFirma", kategoria: "test" }];
  }
  if (filterCategory) {
    targets = targets.filter((c) => c.kategoria === filterCategory);
  }

  console.log(`\n📧 PrzedmiarAI Cold Outreach`);
  console.log(`${"─".repeat(45)}`);
  console.log(`   Tryb:      ${dryRun ? "🔍 DRY RUN (bez wysyłki)" : "🚀 WYSYŁKA"}`);
  console.log(`   Kontakty:  ${targets.length}`);
  console.log(`   Temat:     ${SUBJECT}`);
  console.log(`   From:      ${FROM}`);
  console.log(`${"─".repeat(45)}\n`);

  if (!dryRun && !testEmail) {
    console.log("⚠️  Wysyłka za 5 sekund... (Ctrl+C żeby przerwać)\n");
    await sleep(5000);
  }

  // Init Resend (only if not dry run)
  let resend: Resend | null = null;
  if (!dryRun) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("❌ Brak RESEND_API_KEY w env! Ustaw: export RESEND_API_KEY=re_...");
      process.exit(1);
    }
    resend = new Resend(apiKey);
  }

  let sent = 0;
  let errors = 0;

  for (let i = 0; i < targets.length; i++) {
    const contact = targets[i];
    const html = personalize(template, contact);
    const prefix = `[${i + 1}/${targets.length}]`;

    if (dryRun) {
      console.log(`${prefix} 📋 ${contact.email} (${contact.firma}) — ${contact.name || "brak imienia"}`);
      sent++;
      continue;
    }

    try {
      const { error } = await resend!.emails.send({
        from: FROM,
        to: contact.email,
        replyTo: REPLY_TO,
        subject: SUBJECT,
        html,
      });

      if (error) {
        console.error(`${prefix} ✗ ${contact.email} — ${error.message}`);
        errors++;
      } else {
        console.log(`${prefix} ✓ ${contact.email} (${contact.firma})`);
        sent++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`${prefix} ✗ ${contact.email} — ${message}`);
      errors++;
    }

    // Delay between emails
    if (i < targets.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Summary
  console.log(`\n${"─".repeat(45)}`);
  console.log(`✅ Wysłano: ${sent}`);
  if (errors > 0) console.log(`❌ Błędy:   ${errors}`);
  console.log(`${"─".repeat(45)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
