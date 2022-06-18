import React, { useState, useCallback } from "react";
import {
  ReferenceInput,
  AutocompleteInput,
  ImageField,
  FormDataConsumer,
  ReferenceField,
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

const ImageReferenceInput = (props) => {
  const classes = useStyles();
  const [version, setVersion] = useState(0);
  const handleChange = useCallback(() => setVersion(version + 1), [version]);

  return (
    <div>
      <div className={classes.root}>
        <ReferenceInput key={version} {...props} allowEmpty={true}>
          <AutocompleteInput optionText="name" />
        </ReferenceInput>
        <ImageQuickCreateButton onChange={handleChange} source={props.source} />
      </div>
      <br />
      <FormDataConsumer>
        {({ formData }) => (
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
