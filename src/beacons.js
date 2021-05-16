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
  EditButton,
  DeleteButton,
  DateTimeInput
} from "react-admin";

const BeaconFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
    return <span>Beacon{record && record.name ? `："${record.name}"` : ''}</span>;
};

export const BeaconList = (props) => (
  <List title={<Title/>} {...props}  filters={<BeaconFilter />}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <TextField label="Beacon ID" source="beaconId" />
      <TextField label="說明" source="description" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const BeaconCreate = (props) => (
  <Create title={<Title />} {...props} >
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <TextInput label="Beacon ID" source="beaconId" />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Create>
);

export const BeaconEdit = (props) => (
  <Edit title={<Title />}  {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
      <TextInput label="名稱" source="name" />
      <TextInput label="Beacon ID" source="beaconId" />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Edit>
);
