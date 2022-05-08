import React, { useState, useCallback } from "react";
import { useFormState } from "react-final-form";
import {
  ReferenceInput,
  AutocompleteInput,
  ImageField,
  FormDataConsumer,
  ReferenceField,
  TextField,
} from "react-admin";
import { makeStyles } from "@material-ui/core/styles";

import ImageQuickCreateButton from "./ImageQuickCreateButton";

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

const ImageReferenceInput = (props) => {
  const classes = useStyles();
  const [version, setVersion] = useState(0);
  const { values } = useFormState({ subscription: spySubscription });
  const handleChange = useCallback(() => setVersion(version + 1), [version]);

  return (
    <div>
      <div className={classes.root}>
        <ReferenceInput key={version} {...props}>
          <AutocompleteInput optionText="name" />
        </ReferenceInput>
        <ImageQuickCreateButton onChange={handleChange} source={props.source} />
      </div>
      <br />
      <FormDataConsumer>
        {({ formData, ...rest }) => (
          <ReferenceField
            key={version}
            label="image"
            record={formData}
            basePath="../images"
            source={props.source}
            reference="images"
          >
            <ImageField source="image.src" />
          </ReferenceField>
        )}
      </FormDataConsumer>
      <br />
    </div>
  );
};

export default ImageReferenceInput;
