import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import bcrypt from "bcryptjs";
import { normalizePhone } from "../src/lib/auth/phone";
import type { Contract } from "../src/prisma/contract.d";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

const phone = normalizePhone(process.env.ADMIN_PHONE ?? "");
const password = process.env.ADMIN_PASSWORD ?? "";

if (!phone || password.length < 8 || password.length > 72) {
  console.error("ADMIN_PHONE و ADMIN_PASSWORD را بگذار. شماره موبایل ایران، رمز بین ۸ تا ۷۲ حرف.");
  process.exit(1);
}

const db = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL!,
});

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.orm.aroma.User.where((row) => row.phone.eq(phone)).first();

  if (existing) {
    await db.orm.aroma.User.where((row) => row.id.eq(existing.id)).update({
      role: "admin",
      passwordHash,
    });
    console.log("حساب موجود به مدیر ارتقا پیدا کرد.");
  } else {
    await db.orm.aroma.User.create({
      phone,
      passwordHash,
      name: "مدیر",
      role: "admin",
    });
    console.log("حساب مدیر ساخته شد.");
  }

  await db.close();
}
