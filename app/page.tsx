"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Printer, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoubleSidedType, PrintQuality } from "@/lib/types";
import { getColorLevels } from "@/lib/print";
import Link from "next/link";
export default function PrinterUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState(1);
  const [color, setColor] = useState(false);
  const [doubleSided, setDoubleSided] = useState<DoubleSidedType>("None");
  const [quality, setQuality] = useState<PrintQuality>("Normal");
  const [uploadPercentage, setUploadPercentage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [inkLevels, setInkLevels] = useState<Record<string, number> | null>({
    black: 0,
    yellow: 0,
    magenta: 0,
    cyan: 0,
  });

  useEffect(() => {
    getColorLevels().then(setInkLevels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    setError(null);
    setUploadPercentage(0);
    if (!file) return setError("Voeg een bestand toe");
    setWorking(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("amount", amount.toString());
    formData.append("color", color.toString());
    formData.append("doubleSided", doubleSided.toString());
    formData.append("quality", quality.toString());
    const req = new XMLHttpRequest();
    req.open("POST", "/api/upload");
    req.send(formData);
    req.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadPercentage(e.loaded / e.total);
      }
    };
    req.onload = () => {
      const res = JSON.parse(req.responseText);
      if (req.status === 200) {
        setUploadPercentage(100);
        setWorking(false);
      } else {
        setError("Er is een fout opgetreden: " + JSON.stringify(res));
        setWorking(false);
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Printer />
            Printer
          </h1>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Inktniveaus</h2>
            <div>
              <Label className="mb-1 block">Zwart ({inkLevels?.black}%)</Label>
              <Progress value={inkLevels?.black} className="[&>*]:bg-black" />
            </div>
            <div>
              <Label className="mb-1 block">Geel ({inkLevels?.yellow}%)</Label>
              <Progress
                value={inkLevels?.yellow}
                className="[&>*]:bg-yellow-500"
              />
            </div>
            <div>
              <Label className="mb-1 block">
                Magenta ({inkLevels?.magenta}%)
              </Label>
              <Progress
                value={inkLevels?.magenta}
                className="[&>*]:bg-magenta-500"
              />
            </div>
            <div>
              <Label className="mb-1 block">Cyaan ({inkLevels?.cyan}%)</Label>
              <Progress value={inkLevels?.cyan} className="[&>*]:bg-cyan-500" />
            </div>
          </div>

          <h2 className="text-lg font-semibold">Printen</h2>

          <div className="space-y-2">
            <Label>Bestand</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.ps,.txt,.jpg,.jpeg,.png,.gif,.pcl,.xps,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              disabled={working}
            />
          </div>

          <div className="space-y-2">
            <Label>Aantal</Label>
            <Input
              type="number"
              value={amount}
              min={1}
              max={100}
              disabled={working}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (isNaN(value)) return;
                setAmount(value);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Kleur</Label>
            <Switch
              checked={color}
              onCheckedChange={setColor}
              disabled={working}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Dubbelzijdig</Label>
            <Select
              value={doubleSided}
              onValueChange={(type) => setDoubleSided(type as DoubleSidedType)}
              disabled={working}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer dubbelzijdig" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">Geen</SelectItem>
                <SelectItem value="LongEdge">Lange zijde</SelectItem>
                <SelectItem value="ShortEdge">Korte zijde</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Kwaliteit</Label>
            <Select
              value={quality}
              onValueChange={(type) => setQuality(type as PrintQuality)}
              disabled={working}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer kwaliteit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normaal</SelectItem>
                <SelectItem value="High">Hoog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full cursor-pointer disabled:opacity-50"
            onClick={handleSubmit}
            disabled={working || file === null}
          >
            <Upload />
            Printen!
          </Button>
          {uploadPercentage && (
            <Progress className="mt-2" value={uploadPercentage} max={100} />
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Foutmelding</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {uploadPercentage === 100 && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gelukt!</AlertTitle>
              <AlertDescription>Je printje is onderweg.</AlertDescription>
            </Alert>
          )}
          <Link href="/queue">Wachtrij</Link>
        </CardContent>
      </Card>
    </div>
  );
}
