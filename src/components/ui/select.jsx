import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

function SelectGroup(props) {
  return <SelectPrimitive.Group {...props} />;
}

function SelectValue(props) {
  return <SelectPrimitive.Value {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      {...props}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex w-full h-12 items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-sm shadow-sm outline-none hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
        className
      )}
    >
      {children}

      <SelectPrimitive.Icon>
        <ChevronDownIcon className="h-4 w-4 opacity-70" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  children,
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        sideOffset={6}
        className="fixed z-[999999]"
      >
        <SelectPrimitive.Popup
          {...props}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "max-h-72 w-[var(--anchor-width)] overflow-auto rounded-xl border bg-white shadow-2xl",
            className
          )}
        >
          <SelectPrimitive.List>
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel(props) {
  return (
    <SelectPrimitive.GroupLabel
      className="px-3 py-2 text-xs font-semibold text-slate-500"
      {...props}
    />
  );
}

function SelectItem({
  children,
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      {...props}
      className={cn(
        "relative flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm hover:bg-blue-50 focus:bg-blue-50",
        className
      )}
    >
      <SelectPrimitive.ItemText>
        {children}
      </SelectPrimitive.ItemText>

      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4 text-blue-600" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator(props) {
  return (
    <SelectPrimitive.Separator
      className="my-1 h-px bg-slate-200"
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};