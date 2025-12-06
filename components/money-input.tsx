"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils";
import { useCallback } from "react";

interface MoneyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export function MoneyInput({
  label,
  value,
  onChange,
  placeholder = "0,00",
  disabled = false,
  required = false,
  id,
  className = "",
}: MoneyInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseMoneyInput(e.target.value);
    onChange(parsed);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label} {required && "*"}
      </Label>
      <Input
        id={id}
        type="text"
        value={formatMoneyInput(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`border-2 focus:border-[#F5C800] ${className}`}
      />
    </div>
  );
}
