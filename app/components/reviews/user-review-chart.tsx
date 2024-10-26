"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardFooter } from "~/components/common/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/common/ui/chart";

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Review = {
  rating: number;
  count: number;
};

export function UserReviewChart({ reviews }: { reviews: Review[] }) {
  console.log("reviews", reviews);
  const mostCommonReview = reviews.reduce((acc, review) => {
    return review.count > acc.count ? review : acc;
  });
  return (
    <Card>
      <CardContent>
        <h2>Review count</h2>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={reviews}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="count" hide />
            <YAxis
              dataKey="rating"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="line" />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Your most common rating is {mostCommonReview.rating}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total reviews since April 2024
        </div>
      </CardFooter>
    </Card>
  );
}
