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
  ChipField,
  ShowButton,
  EditButton,
  DeleteButton,
  RichTextField,
  SelectInput,
  SimpleFormIterator,
  FormDataConsumer,
  FileField,
  FileInput,
  BooleanInput
} from "react-admin";
import RichTextInput from "ra-input-rich-text";

const Title = ({ record }) => {
    return <span>小節{record && record.name ? `："${record.name}"` : ''}</span>;
};

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
  <List title={<Title/>} {...props} filters={<NodeFilter />}>
    <Datagrid>
      <TextField source="name" label="名稱" />
      <ReferenceArrayField label="動作" source="actionIds" reference="actions">
        <SingleFieldList>
          <ChipField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
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
  <Create title={<Title/>} {...props} >
    <SimpleForm>
      <TextInput source="name" label="名稱" />
      <BooleanInput label="第一小節" source="initial" initialValue={false} />
      <FormDataConsumer>
        {({ formData, ...rest }) => formData.initial !== true &&
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
        }
      </FormDataConsumer>
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
  <Edit title={<Title/>} {...props}>
    <SimpleForm>
      <TextInput source="id" options={{ disabled: true }}/>
      <TextInput source="name" label="名稱" />
      <BooleanInput label="第一小節" source="initial" initialValue={false} />
      <FormDataConsumer>
        {({ formData, ...rest }) => formData.initial !== true &&
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
        }
      </FormDataConsumer>
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
