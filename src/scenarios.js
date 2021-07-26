// in src/posts.js
import * as React from "react";
import { firebaseConfig as config } from './FIREBASE_CONFIG';

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
  Button,
  useGetList,
  useRefresh,
  useNotify,
  fetchStart,
  fetchEnd,
  Confirm,
  useMutation
} from "react-admin";
import { createStore } from 'redux'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import {
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";
const xid = require('xid-js');

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
const cdnRoot = 'http://daqiaotou-storage.floraland.tw/ghostspeak_editor'

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
  const notify = useNotify()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
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

  const beaconResult = useGetList(
    'beacons',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const beacons = beaconResult.data

  const imageResult = useGetList(
    'images',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const images = imageResult.data

  const soundResult = useGetList(
    'sounds',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const sounds = soundResult.data

  const [open, setOpen] = useState(false);

  function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    const actionTree = getActionTree(Object.values(actions))
    if (!actionTree) {
        setLoading(false)
        setOpen(false);
        dispatch(fetchEnd());
        notify("沒有初始動作，無法發佈！")
        return
    }
    function getTriggers(currentNode, parentNode) {
      if (currentNode.firstAction) {
        return [{
          id: "",
          actionId: null,
          receiver: "ghost",
          sender: "?u",
          payload: {
            type: "JOIN",
          },
          scenarioId: ""
        }]
      } else {
        const actionId = (currentNode.conditionType === "TEXT") 
          ? parentNode.id + '-popup'
          : parentNode.hasSound
            ? parentNode.id + '-sound'
            : parentNode.hasPopup
              ? parentNode.id + '-popup'
              : parentNode.hasMarker
                ? parentNode.id + '-marker'
                : parentNode.id + '-marker-removal'
        return [{
            id: "",
            actionId: actionId,
            receiver: "ghost",
            sender: "?u",
            payload: {
              // TODO
              type: currentNode.conditionType === "TEXT" ? "TEXT" : "END",
              text: currentNode.userReply
            },
            scenarioId: ""
        }]
      }
    }

    function getCondition(currentNode) {
      const conditionType = currentNode.conditionType === 'TEXT' ? 'ALWAYS' : currentNode.conditionType
        return {
          type: conditionType,
          beaconId: currentNode.beacon ? beacons[currentNode.beacon].beaconId : null,
          threshold: currentNode.beaconThreshold,
          mode: currentNode.beaconType,
          location: currentNode.geofenceCenter ? locations[currentNode.geofenceCenter] : null,
          radius: currentNode.geofenceRadius
        }
    }

    function getActions(currentNode) {
      const condition = getCondition(currentNode)
      const ret = []
      if (currentNode.hasSound) {
        const soundAction = {
          id: currentNode.id + '-sound',
          receiver: "?u",
          sender: "ghost",
          content: {
            task: {
              type: 'SOUND',
              url: currentNode.soundId
                ? `${cdnRoot}/${props.record.id}/sounds/${currentNode.soundId}/sound`
                : null,
              volumeSetting: {
                type: currentNode.mode,
                center: currentNode.locationId ? locations[currentNode.locationId] : null,
                fadeoutSeconds: currentNode.fadeoutSeconds,
                fadeinSeconds: currentNode.fadeinSeconds,
                speechLength: currentNode.speechLength,
                radius: currentNode.range,
                minVolume: currentNode.minVolume
              },
              mode: currentNode.soundType || 'MAIN',
            },
            condition: condition
          }
        }
        ret.push(soundAction)
      }
      if (currentNode.hasPopup) {
        const popupAction = {
          id: currentNode.id + '-popup',
          receiver: "?u",
          sender: "ghost",
          content: {
            task: {
              type: 'POPUP',
              destinations: currentNode.destinations,
              text: currentNode.text,
              choices: currentNode.choices
                ? currentNode.choices.map(c => c.choice) 
                : [],
              pictures: currentNode.pictures
                ? currentNode.pictures.map(p => `${cdnRoot}/${props.record.id}/images/${p.pictureId}/image`)
                : [],
              allowTextReply: (currentNode.allowTextReply)? true : false,
            },
            condition: condition
          }
        }
        ret.push(popupAction)
      }
      if (currentNode.hasMarker) {
        const markerAction = {
          id: currentNode.id + '-marker',
          receiver: "?u",
          sender: "ghost",
          content: {
            task: {
              type: 'MARKER',
              icon: currentNode.markerIcon
                ? `${cdnRoot}/${props.record.id}/images/${currentNode.markerIcon}/image`
                : null,
              location: currentNode.locationId ? locations[currentNode.locationId] : null,
              title: currentNode.title,
              id: currentNode.markerId,
            },
            condition: condition
          }
        }
        ret.push(markerAction)
      }
      if (currentNode.hasMarker) {
        const markerAction = {
          id: currentNode.id + '-marker',
          receiver: "?u",
          sender: "ghost",
          content: {
            task: {
              type: 'MARKER',
              icon: currentNode.markerIcon
                ? `${cdnRoot}/${props.record.id}/images/${currentNode.markerIcon}/image`
                : null,
              location: currentNode.locationId ? locations[currentNode.locationId] : null,
              title: currentNode.title,
            },
            condition: condition
          }
        }
        ret.push(markerAction)
      }
      if (currentNode.hasMarkerRemoval) {
        const markerRemovalAction = {
          id: currentNode.id + '-marker-removal',
          receiver: "?u",
          sender: "ghost",
          content: {
            task: {
              type: 'MARKER_REMOVAL',
              id: currentNode.markerId,
            },
            condition: condition
          }
        }
        ret.push(markerRemovalAction)
      }
      return ret.map(a => ({
        ...a,
        session: {
          scenario: "",
          chapter: ""
        }
      }))
    }

    function getNode(tree, parent) {
      return {
        name: tree.node.firstAction ? 'initial' : tree.node.id,
        children: tree.children ? tree.children.map(c => c.node.id) : [],
        exclusiveWith: [],
        triggers: getTriggers(tree.node, parent? parent.node : null),
        performances: getActions(tree.node).map(a => ({
          action: a,
          delay: tree.node.delay
        }))
      }
    }

    function getNodes(tree, parent) {
      return tree.children.reduce((agg, c) => 
        [...agg, ...getNodes(c, tree)], [getNode(tree, parent)]
      )
    }

    const payload = getNodes(actionTree, null)
    console.log('payload', payload)
    const urlString = `https://ghostspeak.floraland.tw/agent/v1/scenario/graphscript/${props.record.id}`
    const url = new URL(urlString)
    const params = {name: props.record.name, overwrite: true}
    url.search = new URLSearchParams(params).toString();

    fetch(url, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json'
      }
    })
    .then((response) => {
      if (response.ok) {
        notify("成功發佈" + props.record.name)
      } else {
        notify("發佈失敗；原因 =" + response.text)
      }
    })
    .catch(e => {
      notify("發佈失敗；原因 =" + e)
    })
    .finally(() => {
      setLoading(false)
      setOpen(false);
      dispatch(fetchEnd());
    })
  }
  return (<>
    <Button
      label="發佈"
      onClick={handleClick}
      disabled={ disabled || loading }
      primary="true"
    />
    <Confirm
      isOpen={open}
      title="確認發佈"
      content= {`你即將發佈${props.record.name}；使用者的進度將被中斷。確定嗎？`}
      onConfirm={handleConfirm}
      onClose={handleDialogClose}
      confirm="確認發佈"
      cancel="取消"
    />
  </>)
  
}

function CloneButton(props) {
  const disabled = useSelector(state => state.currentScenario.value !== props.record.id);
  const notify = useNotify()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
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

  const beaconResult = useGetList(
    'beacons',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const beacons = beaconResult.data

  const imageResult = useGetList(
    'images',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const images = imageResult.data

  const soundResult = useGetList(
    'sounds',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const sounds = soundResult.data

  const [open, setOpen] = useState(false);
  const createData = JSON.parse(JSON.stringify(props.record))
  const cloneId = xid.next();
  createData.id = cloneId
  createData.name = props.record.name + '-' + cloneId
  const [create, { creating }] = useMutation({
    type: 'create',
    resource: 'scenarios',
    payload: { data: createData }
  });
  const scenarioOtions = {
    logging: true,
    rootRef: 'root_collection/' + createData.id
  }
  const baseProvider = FirebaseDataProvider(config, scenarioOtions)
  const refresh = useRefresh();
  const idMap = new Map()
  Object.keys(actions).forEach(a => idMap.set(a, xid.next()))
  Object.keys(nodes).forEach(a => idMap.set(a, xid.next()))
  Object.keys(locations).forEach(a => idMap.set(a, xid.next()))
  Object.keys(beacons).forEach(a => idMap.set(a, xid.next()))
  Object.keys(images).forEach(a => idMap.set(a, xid.next()))
  Object.keys(sounds).forEach(a => idMap.set(a, xid.next()))
  async function handleConfirm() {
    setOpen(false);
    setLoading(true);
    await create()
    const locationValues = Object.values(locations)
    await Promise.all(locationValues.map(a => {
      const newA = JSON.parse(JSON.stringify(a))
      newA.id = idMap.get(a.id)
      return baseProvider.create('locations', {data: newA})
    }))
    const beaconValues = Object.values(beacons)
    await Promise.all(beaconValues.map(a => {
      const newA = JSON.parse(JSON.stringify(a))
      newA.id = idMap.get(a.id)
      return baseProvider.create('beacons', {data: newA})
    }))
    const imageValues = Object.values(images)
    await Promise.all(imageValues.map(a => {
      const newA = JSON.parse(JSON.stringify(a))
      newA.id = idMap.get(a.id)
      return baseProvider.create('images', {data: newA})
    }))
    const soundValues = Object.values(sounds)
    await Promise.all(soundValues.map(a => {
      const newA = JSON.parse(JSON.stringify(a))
      newA.id = idMap.get(a.id)
      return baseProvider.create('sounds', {data: newA})
    }))
    const actionValues = Object.values(actions)
    await Promise.all(actionValues.map(a => {
      const newA = JSON.parse(JSON.stringify(a))
      newA.id = idMap.get(a.id)
      newA.markerIcon = newA.markerIcon ? idMap.get(newA.markerIcon) : null
      newA.pictureId = newA.pictureId ? idMap.get(newA.pictureId) : null
      newA.soundId = newA.soundId ? idMap.get(newA.soundId) : null
      newA.locationId = newA.locationId ? idMap.get(newA.locationId) : null
      newA.geofenceCenter = newA.geofenceCenter ? idMap.get(newA.geofenceCenter) : null
      newA.beacon = newA.beacon ? idMap.get(newA.beacon) : null
      newA.markerId = newA.markerId ? idMap.get(newA.markerId) : null
      return baseProvider.create('actions', {data: newA})
    }))
    const nodeValues = Object.values(nodes)
    await Promise.all(nodeValues.map(a => {
      const newA = JSON.parse(JSON.stringify(a))
      if (newA.triggers) {
        newA.triggers.map(t => t.replyTo = idMap.get(t.replyTo))
      }
      newA.id = idMap.get(a.id)
      if (newA.actionIds) {
        const test = newA.actionIds.map(id => idMap.get(id))
        newA.actionIds = newA.actionIds.map(id => idMap.get(id))
      }
      if (newA.exclusiveWith) {
        newA.exclusiveWith = newA.exclusiveWith.map(id => idMap.get(id))
      }
      if (newA.children) {
        newA.children = newA.children.map(id => idMap.get(id))
      }
      return baseProvider.create('nodes', {data: newA})
    }))

    setLoading(false);
    setOpen(false);
    dispatch(fetchEnd());
    refresh()
  }
  return (<>
    <Button
      label="複製"
      onClick={handleClick}
      disabled={ disabled || loading }
      primary="true"
    />
    <Confirm
      isOpen={open}
      title="確認複製"
      content= {`你即將複製一份《${props.record.name}》；確定嗎？`}
      onConfirm={handleConfirm}
      onClose={handleDialogClose}
      confirm="確認複製"
      cancel="取消"
    />
  </>)
  };

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
      <CloneButton />
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

export function getActionTree(actions) {
  const initial = actions.find(a => a.firstAction)
  const parentMap = 
    actions.reduce(function(m, a) {
      if (a.parents) {
        a.parents.forEach(p => {
          const orig = m.get(p) || []
          m.set(p, [...orig, a])
        })
        return m
      } else {
        return m
      }
    }, new Map())

  console.log('parentMap', parentMap)
  function createTree(root) {
    const childNodes = parentMap.get(root.id) || []
    console.log('childNodes', childNodes)
    return {
      node: root,
      children: childNodes.filter(c => c).map(c => createTree(c))
    }
  }
  if (initial) return createTree(initial) 
  else return null
}
