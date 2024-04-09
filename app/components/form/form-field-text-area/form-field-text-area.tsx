import { type ReactElement, forwardRef, useId } from "react";

import { Label } from "~/components/common/ui/label";
import { Textarea } from "~/components/common/ui/textarea";
import { InputErrors } from "~/components/form/input-errors";
import { cn } from "~/util/utils";

export type FormFieldTextAreaProps = {
  errors?: Array<string> | null;
  label: string;
  name: string;
};

// The Formfield component really should cover everything so we'll try merge this into that

type Props = FormFieldTextAreaProps & React.HTMLProps<HTMLTextAreaElement>;

export const FormFieldTextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, errors, label, name, ...props }, ref): ReactElement => {
    const id = useId();
    const textAreaId = `${id}-${name}`;
    const textAreaErrorsId = `${id}-${name}-errors`;

    const hasErrors = !!errors?.length;
    return (
      <div className="flex w-full flex-col gap-1.5">
        <Label className="font-bold" htmlFor={textAreaId}>
          {label}
        </Label>
        <Textarea
          name={name}
          className={cn(
            "bg-accent",
            hasErrors && "ring-2 ring-destructive ring-offset-1",
            className,
          )}
          id={textAreaId}
          {...props}
          ref={ref}
          aria-invalid={hasErrors || undefined}
          aria-describedby={hasErrors ? textAreaErrorsId : undefined}
        />
        <div className="min-h-[24px]">
          <InputErrors id={textAreaErrorsId} errors={errors} />
        </div>
      </div>
    );
  },
);

FormFieldTextArea.displayName = "FormFieldTextArea";
