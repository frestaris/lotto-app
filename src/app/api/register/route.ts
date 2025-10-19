import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1️⃣ Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // 2️⃣ Hash the password
    const hashedPassword = await hash(password, 10);

    // 3️⃣ Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // 4️⃣ Return success response
    return NextResponse.json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
