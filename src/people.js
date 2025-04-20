import * as React from "react";
import {
  Datagrid,
  List,
  Create,
  Edit,
  Filter,
  SimpleForm,
  TextField,
  EditButton,
  TextInput,
  required,
} from "react-admin";
import { getDeleteButton } from "./deleteResource";
import ImageReferenceInput from "./ImageReferenceInput";

import { DummyList } from "./dummy";
const PeopleFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
  return (
    <span>
      《{localStorage.getItem("scenarioName")}》朋友
      {record && record.name ? `：'${record.name}'` : ""}
    </span>
  );
};

const PeopleDelete = (props) => {
  const paths = ["people"];
  return getDeleteButton(props, "people", "朋友", paths.join(","));
};

export const PeopleList = (props) => {
  if (localStorage.getItem("scenario")) {
    return (
      <List
        title={<Title />}
        {...props}
        perPage="100"
        sort={{ field: "name", order: "ASC" }}
        filters={<PeopleFilter />}
      >
        <Datagrid>
          <TextField label="編號" source="rowIndex" />
          <TextField label="代號" source="id" />
          <TextField label="名字" source="name" />
          <EditButton label="" />
          <PeopleDelete label="" redirect={false} />
        </Datagrid>
      </List>
    );
  } else return DummyList(props);
};

const InputForm = (props) => {
  return (
    <SimpleForm {...props}>
      <>
        <TextInput label="姓名" source="name" />
        <br />
        <TextInput label="代號" source="id" />
        <br />
        <ImageReferenceInput
          label="圖示"
          source="userPortrait"
          reference="images"
          validate={[required()]}
          sort={{ field: "lastupdate", order: "DESC" }}
          perPage={1000}
          allowEmpty
        />
      </>
    </SimpleForm>
  );
};

export const PeopleCreate = (props) => (
  <Create title={<Title />} {...props}>
    <InputForm {...props} />
  </Create>
);

export const PeopleEdit = (props) => (
  <Edit title={<Title />} {...props}>
    <InputForm {...props} />
  </Edit>
);
