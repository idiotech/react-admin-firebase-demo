import * as React from "react";
import PropTypes from "prop-types";

import { NumberInput, TextInput, required, number } from "react-admin";
import { useForm } from "react-final-form";

const validateCoordinate = [required(), number()];

export const CoordinateInput = (formData) => {
  const form = useForm();
  function handleLatLngChange(event) {
    const parts = event.target.value.replace(" ", "").split(",");
    if (parts.length == 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      form.change("lat", parts[0]);
      form.change("lon", parts[1]);
    }
  }
  const initialLatLng = formData.lat + "," + formData.lon;

  return (
    <>
      <span>
        <TextInput
          source="latLng"
          label="經緯度"
          onChange={handleLatLngChange}
          initialValue={initialLatLng}
        />
        <br />
        <NumberInput
          source="lat"
          label="緯度"
          validate={validateCoordinate}
          disabled
        />
        &nbsp;
        <NumberInput
          source="lon"
          label="經度"
          validate={validateCoordinate}
          disabled
        />
      </span>
    </>
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
