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
  AutocompleteInput,
  AutocompleteArrayInput,
  ArrayInput,
  TextField,
  TextInput,
  ShowButton,
  EditButton,
  DeleteButton,
  RichTextField,
  SelectInput,
  SimpleFormIterator,
  FormDataConsumer,
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

const triggerTypes = [
          { id: 'START', name: '開始' },
          { id: 'END', name: '結束' },
          { id: 'TEXT', name: '文字回應' }
]


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
        <SingleFieldList>
          <TextField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
    </SimpleShowLayout>
  </Show>
);

export const NodeCreate = (props) => (
  <Create {...props} >
    <SimpleForm>
      <TextInput source="name" />
      <ArrayInput label="觸發條件" source="triggers">
        <SimpleFormIterator>
          <ReferenceInput label="動作" source="replyTo" reference="actions">
            <AutocompleteInput optionText="name" />
          </ReferenceInput>
          <SelectInput label="狀態" source="category" choices={triggerTypes} />
          <FormDataConsumer>
            {({ getSource, scopedFormData }) => 
              scopedFormData && scopedFormData.category === 'TEXT' && 
              <TextInput label="內文" source={getSource('text')} />
            }
          </FormDataConsumer>
        </SimpleFormIterator>
      </ArrayInput>

      <ReferenceArrayInput label="動作" source="actionIds" reference="actions">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
      <ReferenceArrayInput label="互斥於" source="exclusiveWith" reference="nodes">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
      <ReferenceArrayInput label="下一步" source="children" reference="nodes">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export const NodeEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" options={{ disabled: true }}/>
      <ArrayInput label="觸發條件" source="triggers">
        <SimpleFormIterator>
          <ReferenceInput label="動作" source="replyTo" reference="actions">
            <AutocompleteInput optionText="name" />
          </ReferenceInput>
          <SelectInput label="狀態" source="category" choices={triggerTypes} />
          <FormDataConsumer>
            {({ getSource, scopedFormData }) => 
              scopedFormData && scopedFormData.category === 'TEXT' && 
              <TextInput label="內文" source={getSource('text')} />
            }
          </FormDataConsumer>
        </SimpleFormIterator>
      </ArrayInput>

      <ReferenceArrayInput label="動作" source="actionIds" reference="actions">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
      <ReferenceArrayInput label="互斥於" source="exclusiveWith" reference="nodes">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
      <ReferenceArrayInput label="下一步" source="children" reference="nodes">
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
