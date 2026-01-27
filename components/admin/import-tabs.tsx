"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TitleImport from "@/components/admin/title-import";
import PeopleImport from "@/components/admin/people-import";

export default function ImportTabs() {
  return (
    <Tabs defaultValue="titles" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="titles">Titles (Movies & Series)</TabsTrigger>
        <TabsTrigger value="people">People</TabsTrigger>
      </TabsList>

      <TabsContent value="titles" className="mt-6">
        <TitleImport />
      </TabsContent>

      <TabsContent value="people" className="mt-6">
        <PeopleImport />
      </TabsContent>
    </Tabs>
  );
}