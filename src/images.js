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
  ImageField,
  ImageInput
} from "react-admin";

const ImageFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
    return <span>《{localStorage.getItem('scenarioName')}》圖片{record && record.name ? `："${record.name}"` : ''}</span>;
};

export const ImageList = (props) => (
  <List title={<Title/>} {...props}  filters={<ImageFilter />}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <ImageField label="圖片" source="image.src"/>
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const ImageCreate = (props) => (
  <Create title={<Title />} {...props} >
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <ImageInput label="圖片" source="image">
        <ImageField source="src" title="name"/>
      </ImageInput>
    </SimpleForm>
  </Create>
);

export const ImageEdit = (props) => (
  <Edit title={<Title />}  {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput label="名稱" source="name" />
      <ImageInput label="圖片" source="image">
        <ImageField source="src" title="name"/>
      </ImageInput>
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
    </SimpleForm>
  </Edit>
);
