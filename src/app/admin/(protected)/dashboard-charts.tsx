"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type DailyCount = { date: string; count: number };

type DailyBarChartProps = {
  data: DailyCount[];
  dataKey: string;
  name: string;
  color: string;
};

export function DailyBarChart({ data, dataKey, name, color }: DailyBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-zinc-500"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-zinc-500"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, white)",
              border: "1px solid var(--border-zinc-200)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--text-zinc-900)" }}
          />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type DailyVoteSplit = { date: string; up: number; down: number };

type DailyVotesStackedChartProps = {
  data: DailyVoteSplit[];
};

export function DailyVotesStackedChart({ data }: DailyVotesStackedChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-zinc-500"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-zinc-500"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, white)",
              border: "1px solid var(--border-zinc-200)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--text-zinc-900)" }}
          />
          <Bar dataKey="up" name="Upvotes" stackId="votes" fill="#059669" radius={[0, 0, 0, 0]} />
          <Bar
            dataKey="down"
            name="Downvotes"
            stackId="votes"
            fill="#dc2626"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
