import * as React from "react";
import PropTypes from "prop-types";

import { NumberInput, required, number } from "react-admin";

const validateCoordinate = [required(), number()];

export const CoordinateInput = () => {
  return (
    <span>
      <NumberInput source="lat" label="緯度" validate={validateCoordinate} />
      &nbsp;
      <NumberInput source="lon" label="經度" validate={validateCoordinate} />
    </span>
  );
};

export const CoordinateField = ({ record = {} }) => (
  <span>
    {record["lat"]},{record["lon"]}
  </span>
);

CoordinateField.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};

CoordinateField.defaultProps = { label: "Coordinates", addLabel: true };
