import * as React from "react";
import PropTypes from "prop-types";

import { NumberInput, required, number } from "react-admin";
import { useForm } from "react-final-form";

const validateCoordinate = [required(), number()];

import LocationPicker from "react-location-picker";
/* Default position */
const defaultPosition = {
  lat: 25.06500005645275,
  lng: 121.50936130108107,
};

export const CoordinateInput = (formData) => {
  const form = useForm();

  function handleLocationChange({ position }) {
    form.change("lat", position.lat);
    form.change("lon", position.lng);
  }

  function getDefaultPosition() {
    if (formData.record && formData.record.lat) {
      return { lat: formData.record.lat, lng: formData.record.lon };
    } else {
      return defaultPosition;
    }
  }

  // navigator && navigator.geolocation.getCurrentPosition(position => {
  //   const { latitude, longitude } = position.coords;
  //   if (!formData.record || !formData.record.lat) {
  //     form.change("lat", latitude)
  //     form.change("lon", longitude)
  //   }
  // });

  return (
    <>
      <span>
        <NumberInput source="lat" label="緯度" validate={validateCoordinate} />
        &nbsp;
        <NumberInput source="lon" label="經度" validate={validateCoordinate} />
      </span>
      <LocationPicker
        containerElement={<div style={{ height: "60%" }} />}
        mapElement={<div style={{ height: "500px" }} />}
        defaultPosition={getDefaultPosition()}
        radius={-1}
        zoom={17}
        onChange={handleLocationChange}
      />
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
