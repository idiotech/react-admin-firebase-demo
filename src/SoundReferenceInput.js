import React, { useState, useCallback } from "react";
import {
  ReferenceInput,
  AutocompleteInput,
  FileField,
  FormDataConsumer,
  ReferenceField,
} from "react-admin";
import { makeStyles } from "@material-ui/core/styles";

import SoundQuickCreateButton from "./SoundQuickCreateButton";

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});

const SoundReferenceInput = (props) => {
  const classes = useStyles();
  const [version, setVersion] = useState(0);
  const handleChange = useCallback(() => setVersion(version + 1), [version]);

  return (
    <>
      <div className={classes.root}>
        <ReferenceInput key={version} {...props}>
          <AutocompleteInput optionText="name" />
        </ReferenceInput>
        <SoundQuickCreateButton onChange={handleChange} source={props.source} />
      </div>
      <br />
      <FormDataConsumer>
        {({ formData }) => (
          <ReferenceField
            key={version}
            label="sound"
            record={formData}
            basePath="sounds"
            source={props.source}
            reference="sounds"
          >
            <FileField title={"音檔"} source="sound.src" />
          </ReferenceField>
        )}
      </FormDataConsumer>
      <br />
    </>
  );
};

export default SoundReferenceInput;
