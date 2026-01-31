"use client";
import dynamic from "next/dynamic";

const BottomNavigation = dynamic(() => import("@/components/ott/bottom-navigation"), { ssr: false });

export default function MobileDock() {
  return <BottomNavigation />;
}
