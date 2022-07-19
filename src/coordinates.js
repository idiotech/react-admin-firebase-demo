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
  const [position, setPosition] = React.useState(defaultPosition);
  const [initial, setInitial] = React.useState(true);
  function handleLocationChange({ position }) {
    form.change("lat", position.lat);
    form.change("lon", position.lng);
  }

  React.useEffect(() => {
    navigator &&
      navigator.geolocation.getCurrentPosition((position) => {
        // const { latitude, longitude } = position.coords;
        if (!formData.lat) {
          console.log("current position", position);
          // form.change("lat", latitude)
          // form.change("lon", longitude)
          // setPosition({lat: latitude, lng: longitude})
        } else {
          if (initial) {
            setPosition({ lat: formData.lat, lng: formData.lon });
            setInitial(false);
          }
        }
      });
  });

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
        defaultPosition={position}
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
