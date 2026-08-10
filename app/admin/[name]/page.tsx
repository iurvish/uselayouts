"use client";

import { use } from "react";
import { ComponentEditor } from "@/components/admin/component-editor";

export default function AdminEditPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  return <ComponentEditor mode="edit" initialName={name} />;
}
