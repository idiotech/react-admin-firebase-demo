// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Create,
  Edit,
  Filter,
  SimpleShowLayout,
  SimpleForm,
  TextField,
  TextInput,
  ShowButton,
  EditButton,
  DeleteButton,
  NumberInput,
  ShowController,
  SelectInput,
  SelectField,
  ReferenceInput,
  ReferenceField,
  ShowView,
  FormDataConsumer
} from "react-admin";


const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const actionTypes = [
          { id: 'SOUND', name: 'Sound' },
          { id: 'POPUP', name: 'Text / Image' },
          { id: 'MARKER', name: 'New Map Marker' },
          { id: 'MARKER REMOVAL', name: 'Remove Map Marker' },
]

export const ActionList = (props) => (
  <List {...props} filters={<ActionFilter/>}>
    <Datagrid>
      <TextField source="name" />
      <SelectField source="category" choices={actionTypes} />
      <TextField multiline source="description" />
      <ShowButton label="" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);


// eslint-disable-next-line
const ActionShow = props => (
    <ShowController {...props}>
        {controllerProps =>
            <ShowView {...props} {...controllerProps}>
                <SimpleShowLayout>
                    <TextField source="name" />
                    <TextField source="category" />
                    {
                        controllerProps.record && controllerProps.record.category === 'MARKER' &&
                        <div>
                          <TextField source="title"/>
                          <TextField source="icon"/>
                          <ReferenceField label="Location" source="locationId" reference="locations">
                            <TextField source="name" />
                          </ReferenceField>
                        </div>
                    }
                    {
                        controllerProps.record && controllerProps.record.category === 'SOUND' &&
                        <TextField source="url" />
                    }
                    {
                        controllerProps.record && controllerProps.record.category === 'POPUP' &&
                        <TextField source="text" />
                    }
                    <TextField multiline source="description" />
                </SimpleShowLayout>
            </ShowView>
        }
    </ShowController>
);


export const ActionCreate = (props) => (
  <Create {...props} >
    <SimpleForm>
      <TextInput source="name" />
      <SelectInput source="category" choices={actionTypes} />
      <FormDataConsumer>
        {({ formData, ...rest }) => formData.category === 'MARKER' &&
         <div>
           <TextInput source="title" /><br/>
           <TextInput source="icon" /><br/>
           <ReferenceInput label="Location" source="locationId" reference="locations">
             <SelectInput optionText="name" />
           </ReferenceInput>
         </div>
        }
      </FormDataConsumer>
      <TextInput multiline source="description" />
    </SimpleForm>
  </Create>
);

export const ActionEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput disabled source="createdate" />
      <TextInput disabled source="lastupdate" />
      <TextInput source="name" />
      <NumberInput source="latitide" />
      <NumberInput source="longitude" />
      <TextInput multiline source="description" />
    </SimpleForm>
  </Edit>
);
