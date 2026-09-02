import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: "officer@mba.edu" } });
    if (!existing) {
      const password = await bcrypt.hash("password123", 10);
      await prisma.user.create({
        data: {
          name: "Admission Officer",
          email: "officer@mba.edu",
          password: password,
          role: "OFFICER",
        }
      });
      return NextResponse.json({ message: "Officer account created: officer@mba.edu / password123" });
    }
    return NextResponse.json({ message: "Officer account already exists." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
