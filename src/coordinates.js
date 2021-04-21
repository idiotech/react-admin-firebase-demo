import * as React from "react";
import PropTypes from 'prop-types';

import { NumberInput } from 'react-admin';

export const CoordinateInput = props => {
  return (
    <span>
        <NumberInput source="lat" label="latitude" />
        &nbsp;
        <NumberInput source="lon" label="longitude" />
    </span>
  )
};

export const CoordinateField = ({ source, record = {} }) => <span>{record['lat']},{record['lon']}</span>;

CoordinateField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

CoordinateField.defaultProps = { label: 'Coordinates', addLabel: true };
