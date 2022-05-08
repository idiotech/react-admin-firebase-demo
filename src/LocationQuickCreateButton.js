import React, { useState } from "react";
import { useForm } from "react-final-form";
import {
  required,
  Button,
  SaveButton,
  TextInput,
  useCreate,
  useNotify,
  FormWithRedirect,
} from "react-admin";
import IconContentAdd from "@material-ui/icons/Add";
import IconCancel from "@material-ui/icons/Cancel";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { CoordinateInput, CoordinateField } from "./coordinates";

function LocationQuickCreateButton({ onChange, source }) {
  const [showDialog, setShowDialog] = useState(false);
  const [create, { loading }] = useCreate("locations");
  const notify = useNotify();
  const form = useForm();

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
  };

  const handleSubmit = async (values) => {
    create(
      { payload: { data: values } },
      {
        onSuccess: ({ data }) => {
          setShowDialog(false);
          // Update the comment form to target the newly created post
          // Updating the ReferenceInput value will force it to reload the available posts
          form.change(source, data.id);
          onChange();
        },
        onFailure: ({ error }) => {
          notify(error.message, "error");
        },
      }
    );
  };

  return (
    <>
      <Button onClick={handleClick} label="ra.action.create">
        <IconContentAdd />
      </Button>
      <Dialog
        fullWidth
        open={showDialog}
        onClose={handleCloseClick}
        aria-label="Create location"
      >
        <DialogTitle>建立地點</DialogTitle>

        <FormWithRedirect
          resource="locations"
          save={handleSubmit}
          render={({ handleSubmitWithRedirect, pristine, saving }) => (
            <>
              <DialogContent>
                <TextInput
                  label="名稱"
                  validate={required()}
                  source="name"
                  fullWidth
                />
                <CoordinateInput />
                <TextInput label="說明" source="description" fullWidth />
              </DialogContent>
              <DialogActions>
                <Button
                  label="ra.action.cancel"
                  onClick={handleCloseClick}
                  disabled={loading}
                >
                  <IconCancel />
                </Button>
                <SaveButton
                  handleSubmitWithRedirect={handleSubmitWithRedirect}
                  pristine={pristine}
                  saving={saving}
                  disabled={loading}
                />
              </DialogActions>
            </>
          )}
        />
      </Dialog>
    </>
  );
}

export default LocationQuickCreateButton;
