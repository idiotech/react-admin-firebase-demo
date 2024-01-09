import * as React from "react";
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
  FileField,
  FileInput,
} from "react-admin";
import { getDeleteButton } from "./deleteResource";

import { DummyList } from "./dummy";
const MapStyleFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
  return (
    <span>
      《{localStorage.getItem("scenarioName")}》地圖樣式
      {record && record.name ? `："${record.name}"` : ""}
    </span>
  );
};

const MapStyleDelete = (props) => {
  const paths = ["mapStyle"];
  return getDeleteButton(props, "mapStyles", "地圖樣式", paths.join(","));
};

export const MapStyleList = (props) => {
  if (localStorage.getItem("scenario")) {
    return (
      <List
        title={<Title />}
        {...props}
        perPage="100"
        sort={{ field: "name", order: "ASC" }}
        filters={<MapStyleFilter />}
      >
        <Datagrid>
          <TextField label="編號" source="rowIndex" />
          <TextField label="名稱" source="name" />
          <FileField label="地圖樣式" source="mapStyle.src" title={"連結"} />
          <EditButton label="" />
          <MapStyleDelete label="" redirect={false} />
        </Datagrid>
      </List>
    );
  } else return DummyList(props);
};

export const MapStyleCreate = (props) => (
  <Create title={<Title />} {...props}>
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <FileInput label="地圖樣式" source="mapStyle">
        <FileField source="src" title="name" />
      </FileInput>
    </SimpleForm>
  </Create>
);

export const MapStyleEdit = (props) => (
  <Edit title={<Title />} {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput label="名稱" source="name" />
      <FileInput label="地圖樣式" source="mapStyle">
        <FileField source="src" title="name" />
      </FileInput>
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
    </SimpleForm>
  </Edit>
);
