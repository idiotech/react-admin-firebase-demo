import { Field } from 'react-final-form';
import { Labeled } from 'react-admin';

const CoordinateInput = () => (
    <Labeled label="position">
        <span>
            <Field name="latitude" component="input" type="number" placeholder="latitude" />
            &nbsp;
            <Field name="longitude" component="input" type="number" placeholder="longitude" />
        </span>
    </Labeled>
);
export default CoordinateInput;
