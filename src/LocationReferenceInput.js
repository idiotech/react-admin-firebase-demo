import React, { useState, useCallback } from "react";
import { ReferenceInput, AutocompleteInput } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";

import LocationQuickCreateButton from "./LocationQuickCreateButton";

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});

const LocationReferenceInput = (props) => {
  const classes = useStyles();
  const [version, setVersion] = useState(0);
  const handleChange = useCallback(() => setVersion(version + 1), [version]);
  return (
    <div>
      <div className={classes.root}>
        <ReferenceInput key={version} {...props}>
          <AutocompleteInput optionText="name" />
        </ReferenceInput>

        <LocationQuickCreateButton
          onChange={handleChange}
          source={props.source}
        />
      </div>
      <br />
    </div>
  );
};

export default LocationReferenceInput;
