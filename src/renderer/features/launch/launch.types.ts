import type { Application, CustomAppRecord } from "../../../shared/types";

export type CustomAppForm = Pick<
  CustomAppRecord,
  "name" | "startUrl" | "category" | "description"
>;

export interface LaunchAppGroup {
  category: string;
  apps: Application[];
  count: number;
}
