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
  SingleFieldList,
  ReferenceField,
  ReferenceArrayField,
  ReferenceInput,
  ReferenceArrayInput,
  AutocompleteArrayInput,
  TextField,
  TextInput,
  ShowButton,
  EditButton,
  DeleteButton,
  RichTextField,
  SelectInput,
  FileField,
  FileInput
} from "react-admin";
import RichTextInput from "ra-input-rich-text";

// node: trigger, actions, id

const NodeFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

export const NodeList = (props) => (
  <List {...props} filters={<NodeFilter />}>
    <Datagrid>
      <TextField source="name" />
      <ReferenceArrayField label="Actions" source="actionIds" reference="actions">
        <SingleFieldList>
          <TextField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
      <ShowButton label="" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const NodeShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <ReferenceArrayField label="Actions" source="actionIds" reference="actions">
         <TextField source="name" />
      </ReferenceArrayField>
    </SimpleShowLayout>
  </Show>
);

export const NodeCreate = (props) => (
  <Create {...props} >
    <SimpleForm>
      <TextInput source="name" />
      <ReferenceArrayInput source="actionIds" reference="actions">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export const NodeEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" options={{ disabled: true }}/>
      <TextInput source="name" />
      <ReferenceArrayInput source="actionIds" reference="actions">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
