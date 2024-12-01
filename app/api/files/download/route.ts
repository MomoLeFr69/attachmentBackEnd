import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "stream";

const allowedFileTypes = ["devoir", "annonce", "activite", "chat"];

export async function GET(req: Request) {
  try {
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

    const url = new URL(req.url);
    const uuid = url.searchParams.get("uuid");
    const filetype = url.searchParams.get("fileType");
    const fileName = url.searchParams.get("fileName");

    if (!uuid || !filetype || !fileName) {
      throw new Error("UUID, fileType ou fileName manquant.");
    }

    if (!allowedFileTypes.includes(filetype)) {
      throw new Error("Wrong filetype");
    }

    const filePath = path.resolve("public/uploads", uuid, filetype, fileName);

    try {
      const fileStats = await fs.stat(filePath);
      if (!fileStats.isFile()) {
        throw new Error("Fichier introuvable.");
      }

      const fileStream = Readable.from(await fs.readFile(filePath));

      return new NextResponse(fileStream, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } catch (err) {
      throw new Error("Fichier introuvable.");
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e.message || e });
  }
}
