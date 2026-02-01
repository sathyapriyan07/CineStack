"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TitleImport from "@/components/admin/title-import";
import PeopleImport from "@/components/admin/people-import";
import EpisodeImport from "@/components/admin/episode-import";

export default function ImportTabs() {
  return (
    <Tabs defaultValue="titles" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="titles">Titles (Movies & Series)</TabsTrigger>
        <TabsTrigger value="people">People</TabsTrigger>
        <TabsTrigger value="episodes">Episodes</TabsTrigger>
      </TabsList>

      <TabsContent value="titles" className="mt-6">
        <TitleImport />
      </TabsContent>

      <TabsContent value="people" className="mt-6">
        <PeopleImport />
      </TabsContent>

      <TabsContent value="episodes" className="mt-6">
        <EpisodeImport />
      </TabsContent>
    </Tabs>
  );
}