import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { TextInput } from "ra-ui-materialui";

const styles = () => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    width: 200,
  },
});

function TimeInput(props) {
  const { classes, source, label } = props;
  return (
    <TextInput
      source={source}
      label={label}
      type="time"
      min="00:00"
      className={classes.textField}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
}

TimeInput.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TimeInput);
