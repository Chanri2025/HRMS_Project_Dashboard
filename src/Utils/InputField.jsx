import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const InputField = ({ label, ...rest }) => (
  <div className="grid gap-2">
    {label && <Label>{label}</Label>}
    <Input {...rest} />
  </div>
);

export default InputField;
