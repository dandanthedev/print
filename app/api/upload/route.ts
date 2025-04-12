import { print } from "@/lib/print";
import { z } from "zod";

export async function POST(req: Request) {
  const formData = await req.formData();
  const data = {
    file: formData.get("file"),
    amount: parseInt(formData.get("amount") as string),
    color: formData.get("color"),
    doubleSided: formData.get("doubleSided"),
    quality: formData.get("quality"),
  };
  const schema = z.object({
    file: z.instanceof(File),
    amount: z.number().min(1).max(100),
    color: z.union([z.literal("true"), z.literal("false")]),
    doubleSided: z.union([
      z.literal("LongEdge"),
      z.literal("ShortEdge"),
      z.literal("None"),
    ]),
    quality: z.union([z.literal("Normal"), z.literal("High")]),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { file, amount, doubleSided, quality } = parsed.data;
  let color: string | boolean = parsed.data.color;
  color = color === "true";
  const arrBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrBuffer);
  const res = await print(buffer, {
    copies: amount,
    color,
    doubleSided,
    quality,
  });

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
