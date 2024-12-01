import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";

const allowedFileTypes = ["devoir", "annonce", "activite", "chat"];

export async function POST(req: Request) {
  try {
    // Token validation, maybe we should add the uuid ?
    // const token = req.headers.get("Authorization")?.split(" ")[1];
    // if (!token) {
    //   throw new Error("Token manquant dans les headers.");
    // }
    // const response = await fetch("https://example.com/api/validate-token", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    // const data = await response.json();
    // if (!response.ok || data.valid !== true) {
    //   throw new Error("Token invalide.");
    // }

    //upload
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const uuid = formData.get("uuid") as string;
    const filetype = formData.get("fileType") as string;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (!uuid || !filetype) {
      throw new Error("invalid form");
    }
    if (!allowedFileTypes.includes(filetype)) {
      throw new Error("Wrong filetype");
    }

    const uploadDir = path.resolve("public/uploads", uuid, filetype);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, file.name), buffer);

    revalidatePath("/");

    return NextResponse.json({ status: "success" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}
