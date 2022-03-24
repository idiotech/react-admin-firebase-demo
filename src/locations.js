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
  DateTimeInput
} from "react-admin";

import {CoordinateInput, CoordinateField} from "./coordinates"

const LocationFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
    return <span>《{localStorage.getItem('scenarioName')}》地點{record && record.name ? `："${record.name}"` : ''}</span>;
};

export const LocationList = (props) => (
  <List title={<Title/>} {...props} sort={{ field: 'name', order: 'ASC' }} perPage="100" filters={<LocationFilter />}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <CoordinateField label="座標" source="coordinates" label="座標"  />
      <TextField label="說明" source="description" />
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
      <CoordinateField source="coordinates" label="Coordinates" />
      <TextField multiline source="description" />
      <TextField source="createdate" />
      <TextField source="lastupdate" />
    </SimpleShowLayout>
  </Show>
);


export const LocationCreate = (props) => (
  <Create title={<Title />} {...props} >
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <CoordinateInput />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Create>
);

export const LocationEdit = (props) => (
  <Edit title={<Title />}  {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
      <TextInput label="名稱"  source="name" />
      <CoordinateInput />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Edit>
);
