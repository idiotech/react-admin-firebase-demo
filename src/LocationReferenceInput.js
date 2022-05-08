import React, { useState, useCallback } from "react";
import { useFormState } from "react-final-form";
import { ReferenceInput, AutocompleteInput } from "react-admin";
import { makeStyles } from "@material-ui/core/styles";

import LocationQuickCreateButton from "./LocationQuickCreateButton";
// import PostQuickPreviewButton from './PostQuickPreviewButton';

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});

const spySubscription = { values: true };

const LocationReferenceInput = (props) => {
  const classes = useStyles();
  const [version, setVersion] = useState(0);
  const { values } = useFormState({ subscription: spySubscription });
  const handleChange = useCallback(() => setVersion(version + 1), [version]);
  console.log("props test", props);
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
