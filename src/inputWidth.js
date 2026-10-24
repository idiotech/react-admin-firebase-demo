// wide enough for record names and short text, without overflowing a phone
export const longInputSx = { width: 400, maxWidth: "100%" };

// lines up a button or swatch with the input box beside it rather than with
// the whole field, so hint or error text under the input doesn't push it
// down; filled, small, dense inputs sit 8px down and are 48px tall
export const besideInputSx = {
  mt: 1,
  height: 48,
  display: "flex",
  alignItems: "center",
};
