import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * PATCH /api/account
 * Handles edit email, change password, add credits.
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, newEmail, currentPassword, newPassword, addCredits } = body;

    // 🔍 Lookup user by ID instead of email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✉️ Update Email
    if (action === "editEmail") {
      if (!newEmail) {
        return NextResponse.json(
          { error: "Missing new email" },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { email: newEmail },
      });

      return NextResponse.json({ message: "Email updated", user: updated });
    }

    // 🔑 Change Password
    if (action === "changePassword") {
      if (!newPassword) {
        return NextResponse.json(
          { error: "Missing new password" },
          { status: 400 }
        );
      }

      const hashed = await hash(newPassword, 10);

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ message: "Password updated", user: updated });
    }

    // 💰 Add Credits
    if (action === "addCredits") {
      if (!addCredits || addCredits <= 0) {
        return NextResponse.json(
          { error: "Invalid credit amount" },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          creditCents: { increment: Math.floor(addCredits * 100) },
          transactions: {
            create: {
              type: "CREDIT",
              amountCents: Math.floor(addCredits * 100),
              description: "Manual top-up via Settings",
            },
          },
        },
      });

      return NextResponse.json({ message: "Credits added", user: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/account error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account
 * Permanently deletes the authenticated account.
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔍 Lookup user by ID instead of email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/account error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
