// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Show,
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
  NumberField,
  NumberInput,
  ShowController,
  ShowView
} from "react-admin";

const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const actionTypes = ['MARKER', 'SOUND', 'MARKER', 'MARKER_REMOVAL'];

export const ActionList = (props) => (
  <List {...props} filters={<LocationFilter />}>
    <Datagrid>
      <TextField source="name" />
      <TextField source="actionType" />
      <TextField multiline source="description" />
      <ShowButton label="" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);



const ActionShow = props => (
    <ShowController {...props}>
        {controllerProps =>
            <ShowView {...props} {...controllerProps}>
                <SimpleShowLayout>
                    <TextField source="name" />
                    <TextField source="actionType" />
                    {
                        controllerProps.record && controllerProps.record.actionType === 'MARKER' &&
                        <TextField source="title" />
                    }
                    {
                        controllerProps.record && controllerProps.record.actionType === 'SOUND' &&
                        <TextField source="url" />
                    }
                    {
                        controllerProps.record && controllerProps.record.actionType === 'POPUP' &&
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
      <NumberInput source="latitide" />
      <NumberInput source="longitude" />
      <TextInput multiline source="description" />
    </SimpleForm>
  </Create>
);

export const LocationEdit = (props) => (
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
