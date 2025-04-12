"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cancel, getQueue } from "@/lib/print";
import Link from "next/link";
import clsx from "clsx";

export default function PrintQueuePage() {
  const [working, setWorking] = React.useState(false);
  const [queue, setQueue] = React.useState<
    {
      id: string;
      date: string;
      size: string;
      completed: boolean;
    }[]
  >([]);
  const [filteredQueue, setFilteredQueue] = React.useState<
    {
      id: string;
      date: string;
      size: string;
      completed: boolean;
    }[]
  >([]);
  const [showCompleted, setShowCompleted] = React.useState(false);

  useEffect(() => {
    if (working) return;
    (async () => {
      const queue = await getQueue();
      setQueue(queue);
    })();
  }, [working]);

  useEffect(() => {
    const filteredQueue = queue.filter(
      (job) => job.completed === showCompleted
    );
    setFilteredQueue(filteredQueue);
  }, [showCompleted]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 ">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-col sm:flex-row">
            <h1 className="text-2xl font-bold">Printwachtrij</h1>
            <div className="flex items-center flex-wrap justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className={clsx(
                  "cursor-pointer",
                  !showCompleted ? "bg-gray-200" : ""
                )}
                disabled={working}
                onClick={() => setShowCompleted(false)}
              >
                Onderweg
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={clsx(
                  "cursor-pointer",
                  showCompleted ? "bg-gray-200" : ""
                )}
                disabled={working}
                onClick={() => setShowCompleted(true)}
              >
                Voltooid
              </Button>

              <Button
                variant="destructive"
                className="cursor-pointer disabled:opacity-50"
                disabled={
                  working || showCompleted || filteredQueue.length === 0
                }
                onClick={async () => {
                  setWorking(true);
                  await cancel(null);
                  setWorking(false);
                }}
              >
                Alles annuleren
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredQueue.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    {job.date} • {job.size}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={job.completed ? "default" : "secondary"}>
                    {job.completed ? "Voltooid" : "Onderweg"}
                  </Badge>
                  {!job.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer disabled:opacity-50"
                      disabled={working}
                      onClick={async () => {
                        setWorking(true);
                        await cancel(job.id);
                        setWorking(false);
                      }}
                    >
                      Annuleren
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filteredQueue.length === 0 && (
              <div className="text-center text-gray-500">Geen resultaten</div>
            )}
          </div>
          <Link href="/">Terug naar printer</Link>
        </CardContent>
      </Card>
    </div>
  );
}
