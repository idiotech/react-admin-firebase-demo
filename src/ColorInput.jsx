import React from "react";
import { useInput } from "react-admin";
import { Box, TextField } from "@mui/material";
import { besideInputSx } from "./inputWidth";

// Replaces react-admin-color-input, which has no react-admin v4/v5 release.
// Stores the color as a hex string such as "#ffffff".
export const ColorInput = ({ source, label, helperText }) => {
  const { id, field } = useInput({ source });
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
      <TextField
        {...field}
        id={id}
        label={label}
        helperText={helperText}
        size="small"
        value={field.value || ""}
      />
      <Box sx={besideInputSx}>
        <input
          type="color"
          aria-label={label}
          value={field.value || "#000000"}
          onChange={(event) => field.onChange(event.target.value)}
        />
      </Box>
    </Box>
  );
};
