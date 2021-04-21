import * as React from "react";
import {
  Datagrid,
  List,
  Create,
  Edit,
  Filter,
  SimpleShowLayout,
  SimpleForm,
  TextField,
  TextInput,
  ShowButton,
  EditButton,
  DeleteButton,
  ShowController,
  SelectInput,
  SelectField,
  ReferenceInput,
  ReferenceField,
  ShowView,
  FormDataConsumer
} from "react-admin";


const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const actionTypes = [
          { id: 'SOUND', name: '聲音' },
          { id: 'POPUP', name: '圖文訊息' },
          { id: 'MARKER', name: '新增圖釘' },
          { id: 'MARKER REMOVAL', name: '刪除圖釘' },
]

export const ActionList = (props) => (
  <List {...props} filters={<ActionFilter/>}>
    <Datagrid>
      <TextField source="name" />
      <SelectField source="category" choices={actionTypes} />
      <TextField multiline source="description" />
      <ShowButton label="" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);


export const ActionShow = props => (
    <ShowController {...props}>
        {controllerProps =>
            <ShowView {...props} {...controllerProps}>
                <SimpleShowLayout>
                    <TextField source="id" />
                    <TextField source="name" />
                    <SelectField source="category" choices={actionTypes} />
                    {
                        controllerProps.record && controllerProps.record.category === 'MARKER' &&
                        <SimpleShowLayout label="details">
                          <TextField source="title"/>
                          <TextField source="icon"/>
                          <ReferenceField label="Location" source="locationId" reference="locations">
                            <TextField source="name" />
                          </ReferenceField>
                        </SimpleShowLayout>
                    }
                    {
                        controllerProps.record && controllerProps.record.category === 'SOUND' &&
                        <TextField source="url" />
                    }
                    {
                        controllerProps.record && controllerProps.record.category === 'POPUP' &&
                        <TextField source="text" />
                    }
                    <TextField multiline source="description" />
                </SimpleShowLayout>
            </ShowView>
        }
    </ShowController>
);


export const ActionCreate = (props) => (
  <Create {...props} >
    <SimpleForm>
      <TextInput source="name" />
      <SelectInput source="category" choices={actionTypes} />
      <FormDataConsumer>
        {({ formData, ...rest }) => formData.category === 'MARKER' &&
         <div>
           <TextInput source="title" /><br/>
           <TextInput source="icon" /><br/>
           <ReferenceInput label="Location" source="locationId" reference="locations">
             <SelectInput optionText="name" />
           </ReferenceInput>
         </div>
        }
      </FormDataConsumer>
      <TextInput multiline source="description" />
    </SimpleForm>
  </Create>
);

export const ActionEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <SelectInput source="category" choices={actionTypes} />
      <FormDataConsumer>
        {({ formData, ...rest }) => formData.category === 'MARKER' &&
         <div>
           <TextInput source="title" /><br/>
           <TextInput source="icon" /><br/>
           <ReferenceInput label="Location" source="locationId" reference="locations">
             <SelectInput optionText="name" />
           </ReferenceInput>
         </div>
        }
      </FormDataConsumer>
      <TextInput multiline source="description" />
    </SimpleForm>
  </Edit>
);
