import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/common/ui/button";
import { Calendar } from "~/components/common/ui/calendar";
import { Input } from "~/components/common/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/common/ui/popover";

import { cn } from "~/util/utils";

type Props = {
  defaultDate?: Date | undefined;
  name: string;
  range?: {
    start: Date;
    end: Date;
  };
  defaultLabel?: string;
  onSelect?: (date: Date) => void;
};

export function DatePicker({
  defaultDate,
  defaultLabel = "Today",
  name,
  onSelect,
  range,
}: Props) {
  const [date, setDate] = React.useState<Date | undefined>(
    defaultDate ? defaultDate : new Date(),
  );

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      onSelect?.(date);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "flex h-10 w-full justify-between bg-input text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{defaultLabel}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          fromDate={range?.start}
          selected={date}
          onSelect={handleSelect}
          initialFocus
          disabled={
            range ? { before: range?.start, after: range?.end } : undefined
          }
        />
      </PopoverContent>
      <Input
        name={name}
        type="hidden"
        value={date ? format(date, "yyyy-MM-dd") : ""}
      />
    </Popover>
  );
}
