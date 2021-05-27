import React, { useState, useCallback } from 'react';
import { useFormState } from 'react-final-form';
import { ReferenceInput, AutocompleteInput, FileField, FormDataConsumer, ReferenceField, TextField } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';

import SoundQuickCreateButton from './SoundQuickCreateButton';

const useStyles = makeStyles({
    root: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    }
});

const spySubscription = { values: true };

const SoundReferenceInput = props => {
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
            <SoundQuickCreateButton onChange={handleChange} source={props.source} />
        </div>
        <br/>
        <FormDataConsumer>
          {({ formData, ...rest }) => 
            <ReferenceField key={version} label="sound" record={formData} basePath="sounds" source={props.source} reference="sounds">
              <FileField title={"音檔"} source="sound.src" />
            </ReferenceField>
          }
        </FormDataConsumer>
        <br/>
      </div>
    );
};

export default SoundReferenceInput;
