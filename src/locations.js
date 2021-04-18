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
} from "react-admin";

const LocationFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

export const LocationList = (props) => (
  <List {...props} filters={<LocationFilter />}>
    <Datagrid>
      <TextField source="name" />
      <NumberField source="latitide" />
      <NumberField source="longitude" />
      <ShowButton label="" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const LocationShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="latitide" />
      <NumberField source="longitude" />
      <TextField multiline source="description" />
      <TextField source="createdate" />
      <TextField source="lastupdate" />
    </SimpleShowLayout>
  </Show>
);

export const LocationCreate = (props) => (
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
