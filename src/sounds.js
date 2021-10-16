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
  DateTimeInput,
  FileField,
  FileInput
} from "react-admin";

const SoundFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
    return <span>聲音{record && record.name ? `："${record.name}"` : ''}</span>;
};

export const SoundList = (props) => (
  <List title={<Title/>} {...props} perPage="100" sort={{ field: 'name', order: 'ASC' }} filters={<SoundFilter />}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <FileField label="音檔" source="sound.src" title={"連結"}/>
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const SoundCreate = (props) => (
  <Create title={<Title />} {...props} >
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <FileInput label="音檔" source="sound">
        <FileField source="src" title="name"/>
      </FileInput>
    </SimpleForm>
  </Create>
);

export const SoundEdit = (props) => (
  <Edit title={<Title />}  {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput label="名稱" source="name" />
      <FileInput label="音檔" source="sound">
        <FileField source="src" title="name"/>
      </FileInput>
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
    </SimpleForm>
  </Edit>
);
