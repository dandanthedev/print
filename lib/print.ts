"use server";
const printer = "EPSON_ET_2850_Series";
const printerNetwork = "http://192.168.2.145";
import {
  getCompletedQueue,
  getNotCompletedQueue,
  printBuffer,
  cancelAllJobs,
  cancelJob,
  getPrinterNames,
} from "node-cups";
import { z } from "zod";
import { DoubleSidedType, PrintQuality } from "./types";
import axios from "axios";
import https from "https";
import { getDateString, getSize } from "./utils";
const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
export async function getPrinterOptions(
  color: boolean,
  doubleSided: DoubleSidedType,
  quality: PrintQuality
) {
  const printerOptions: Record<string, string> = {};

  if (color) printerOptions.ColorModel = "RGB";
  else printerOptions.ColorModel = "Gray";

  if (doubleSided === "LongEdge") printerOptions.Duplex = "DuplexNoTumble";
  else if (doubleSided === "ShortEdge") printerOptions.Duplex = "DuplexTumble";
  else printerOptions.Duplex = "None";

  if (quality) printerOptions.cupsPrintQuality = quality;

  return printerOptions;
}

export async function print(
  file: Buffer,
  options: {
    copies: number;
    color: boolean;
    doubleSided: DoubleSidedType;
    quality: PrintQuality;
  }
) {
  const schema = z.object({
    copies: z.number().min(1).max(100),
    color: z.boolean(),
    doubleSided: z.union([
      z.literal("LongEdge"),
      z.literal("ShortEdge"),
      z.literal("None"),
    ]),
    quality: z.union([z.literal("Normal"), z.literal("High")]),
  });
  const parsed = schema.safeParse(options);
  if (!parsed.success) {
    throw new Error("Invalid options");
  }
  const { copies, color, doubleSided, quality } = parsed.data;
  const printerOptions = await getPrinterOptions(color, doubleSided, quality);

  const allPrinters = await getPrinterNames();
  console.log(allPrinters);

  const res = await printBuffer(file, {
    copies,
    printerOptions,
    printer: printer,
  });

  return res;
}

export async function getQueue() {
  const completed = (
    await getCompletedQueue({
      printers: [printer],
    })
  ).map((job) => ({
    id: job.id,
    date: job.date,
    size: job.size,
    completed: true,
  }));
  const notCompleted = (
    await getNotCompletedQueue({
      printers: [printer],
    })
  ).map((job) => ({
    id: job.id,
    date: job.date,
    size: job.size,
    completed: false,
  }));
  const queue = notCompleted.concat(completed);
  return queue.map((job) => ({
    ...job,
    size: getSize(job.size),
    date: getDateString(job.date),
  }));
}

export async function cancel(id: string | null) {
  if (!id) await cancelAllJobs();
  else await cancelJob(id);
}

export async function getColorLevels() {
  const url = printerNetwork + "/PRESENTATION/ADVANCED/INFO_PRTINFO/TOP";
  const res = await instance.get(url).then((res) => res.data as string);
  const lines = res.split("\n");
  //find lines with height=
  const heightLines = lines.filter((line) => line.includes("height="));
  //find heights
  const heights = heightLines.map((line) => {
    const height = line.split("height='")[1].split("'")[0];
    return parseInt(height) * 2;
  });
  const heightsWithName = {
    black: heights[0],
    yellow: heights[1],
    magenta: heights[2],
    cyan: heights[3],
  };

  return heightsWithName;
}
