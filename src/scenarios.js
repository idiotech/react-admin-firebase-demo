// in src/posts.js
import * as React from "react";

import { useState, useEffect, useContext } from 'react';
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
  ShowButton,
  EditButton,
  DeleteButton,
  DateTimeInput,
  Button,
  useGetList,
  DataProviderContext,
  useRefresh
} from "react-admin";
import { createStore } from 'redux'
import { useSelector, useDispatch } from 'react-redux';

export function scenarioReducer(state = { value: '' }, action) {
  switch (action.type) {
    case 'setScenario':
      return { value: action.scenario }
    default:
      return state
  }
}

const store = createStore(scenarioReducer)

store.subscribe(() => console.log('listener', store.getState()))

const ScenarioFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

function UseButton(props) {
  const active = useSelector(state => state.currentScenario.value  === props.record.id);
  const dispatch = useDispatch();
  const refresh = useRefresh();
  function handleClick() {
    console.log('click', props)
    dispatch({ type: 'setScenario', scenario: props.record.id })
    refresh();
  }
  return (<Button label="設定為目前劇本"
                  onClick={handleClick}
                  disabled={ active }
                  primary="true"
                  />)
  
}

function PublishButton(props) {
  const disabled = useSelector(state => state.currentScenario.value !== props.record.id);

  const { data, ids, total, loading, loaded, error } = useGetList(
    'nodes',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  function handleClick() {
    console.log('click', data, ids, total, loading, loaded, error)
  }
  return (<Button label="發佈"
                  onClick={handleClick}
                  disabled={ disabled }
                  primary="true"
                  />)
  
}

const Title = ({ record }) => {
    return <span>劇本：{record && record.name ? `："${record.name}"` : ''}</span>;
};

export const ScenarioList = (props) => (
  <List title={<Title/>} {...props}  filters={<ScenarioFilter />}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <TextField label="說明" source="description" />
      <UseButton source="id" />
      <PublishButton />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const ScenarioCreate = (props) => (
  <Create title={<Title />} {...props} >
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Create>
);

export const ScenarioEdit = (props) => (
  <Edit title={<Title />}  {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
      <TextInput label="名稱"  source="name" />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Edit>
);

