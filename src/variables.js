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
  DeleteButton,
  DateTimeInput,
  required,
  number,
  NumberInput,
  NumberField,
} from "react-admin";
import { DummyList } from "./dummy";

const VariableFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
  return (
    <span>
      《{localStorage.getItem("scenarioName")}》變數
      {record && record.name ? `："${record.name}"` : ""}
    </span>
  );
};

export const VariableList = (props) => {
  if (localStorage.getItem("scenario"))
    return (
      <List title={<Title />} {...props} filters={<VariableFilter />}>
        <Datagrid>
          <TextField label="編號" source="rowIndex" />
          <TextField label="名稱" source="name" />
          <NumberField label="初始值" source="value" />
          <TextField label="說明" source="description" />
          <EditButton label="" />
          <DeleteButton label="" redirect={false} />
        </Datagrid>
      </List>
    );
  else return DummyList(props);
};

export const VariableCreate = (props) => (
  <Create title={<Title />} {...props}>
    <SimpleForm>
      <TextInput label="名稱" source="name" validate={[required()]} />
      <NumberInput
        label="初始值"
        source="value"
        validate={[required(), number()]}
      />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Create>
);

export const VariableEdit = (props) => (
  <Edit title={<Title />} {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
      <TextInput label="名稱" source="name" validate={[required()]} />
      <NumberInput
        label="初始值"
        source="value"
        validate={[required(), number()]}
      />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Edit>
);
