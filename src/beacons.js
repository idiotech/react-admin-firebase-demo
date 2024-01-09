// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Create,
  Edit,
  Filter,
  SimpleForm,
  TextField,
  TextInput,
  EditButton,
  DateTimeInput,
} from "react-admin";
import { getDeleteButton } from "./deleteResource";
import { DummyList } from "./dummy";

const BeaconFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
  return (
    <span>
      《{localStorage.getItem("scenarioName")}》Beacon
      {record && record.name ? `："${record.name}"` : ""}
    </span>
  );
};

const BeaconDelete = (props) => {
  const paths = ["beacon"];
  return getDeleteButton(props, "beacons", "beacon", paths.join(","));
};

export const BeaconList = (props) => {
  if (localStorage.getItem("scenario"))
    return (
      <List title={<Title />} {...props} filters={<BeaconFilter />}>
        <Datagrid>
          <TextField label="編號" source="rowIndex" />
          <TextField label="名稱" source="name" />
          <TextField label="Beacon ID" source="beaconId" />
          <TextField label="說明" source="description" />
          <EditButton label="" />
          <BeaconDelete label="" redirect={false} />
        </Datagrid>
      </List>
    );
  else return DummyList(props);
};

export const BeaconCreate = (props) => (
  <Create title={<Title />} {...props}>
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <TextInput label="Beacon ID" source="beaconId" />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Create>
);

export const BeaconEdit = (props) => (
  <Edit title={<Title />} {...props}>
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
