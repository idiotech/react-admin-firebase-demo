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
import { NodeEdit } from "./nodes";

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

  const nodeResult = useGetList(
    'nodes',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const nodes = nodeResult.data

  const actionResult = useGetList(
    'actions',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const actions = actionResult.data

  const locationResult = useGetList(
    'locations',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const locations = locationResult.data
  function handleClick() {
    for (const id in nodes) {
      const node = nodes[id]
      console.log('node', node)
      const scriptNode = {
        name: id,
        children: node.children || [],
        triggers: node.triggers.map(t => {return {
          id: "",
          actionId: t.replyTo,
          receiver: "ghost",
          sender: "?u",
          payload: {
            type: t.category,
            text: t.text
          },
          scenarioId: ""
        }}),
        actions: (node.actionIds || []).map(a => {
          const action = actions[a]
          console.log('action', action)
          return {
            id: action.id,
            receiver: "?u",
            sender: "ghost",
            content: {
              task: {
                type: action.category,
                destinations: action.destinations,
                text: action.text,
                url: action.url,
                volumeSetting: {
                  type: action.mode,
                },
                icon: action.icon,
                location: action.locationId ? locations[action.locationId] : null,
                choices: action.choices || [],
                fadeoutSeconds: action.fadeoutSeconds,
                fadeinSeconds: action.fadeinSeconds,
                speechLength: action.speechLength,
                title: action.title,
                allowTextReply: (action.allowTextReply)? true : false,
                markerId: action.markerId,

              },
              condition: {
                type: action.conditionType,
                id: action.beaconId,
                threshold: action.beaconThreshold,
                mode: action.beaconType,
                location: action.geofenceCenter ? locations[action.geofenceCenter] : null,
                radius: action.geofenceRadius
              }
            },
            session: {
              scenario: "",
              chapter: ""
            }
          }
        })
      }
      console.log('script node', scriptNode)
    }
    // console.log('locations', locations)
    // console.log('actions', actions)
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

