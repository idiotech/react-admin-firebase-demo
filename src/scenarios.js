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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
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

const { buildGPX, BaseBuilder } = require('gpx-builder');
const { Point, Track, Segment } = BaseBuilder.MODELS;

const store = createStore(scenarioReducer)

store.subscribe(() => console.log('listener', store.getState()))

const ScenarioFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);
const cdnRoot = 'http://daqiaotou-storage.floraland.tw/ghostspeak_editor'

function getAllData(getList) {
  const actionResult = getList(
    'actions',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const actions = actionResult.data

  const locationResult = getList(
    'locations',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const locations = locationResult.data

  const beaconResult = getList(
    'beacons',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const beacons = beaconResult.data

  const imageResult = getList(
    'images',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const images = imageResult.data

  const soundResult = getList(
    'sounds',
    { page: 1, perPage: 500 },
    { field: 'published_at', order: 'DESC' }
  );
  const sounds = soundResult.data
  return {actions, locations, beacons, images, sounds};

}

function UseButton(props) {
  const active = useSelector(state => state.currentScenario.value  === props.record.id);
  const dispatch = useDispatch();
  const refresh = useRefresh();
  function handleClick() {
    dispatch({ type: 'setScenario', scenario: props.record.id })
    refresh();
  }
  return (<Button label="設定為目前劇本"
                  onClick={handleClick}
                  disabled={ active }
                  primary="true"
                  />)
}

function getTriggers(currentNode, parents) {
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
  } else return parents.map(p => getTrigger(currentNode, p))
}

function getTrigger(currentNode, parentNode) {
  const parent = parentNode.id
  const conditionType = currentNode[`triggers_${parent}_conditionType`]
  const actionId = (conditionType === "TEXT") 
    ? parentNode.id + '-popup'
    : parentNode.hasSound
      ? parentNode.id + '-sound'
      : parentNode.hasPopup
        ? parentNode.id + '-popup'
        : parentNode.hasIncomingCall
          ? parentNode.id + '-incoming-call'
          : parentNode.hasMarker
            ? parentNode.id + '-marker'
            : parentNode.hasPopupDismissal
              ? parentNode.id + '-popup-dismissal'
              : parentNode.id + '-marker-removal'
  return {
      id: "",
      actionId: actionId,
      receiver: "ghost",
      sender: "?u",
      payload: {
        // TODO
        type: conditionType === "TEXT" ? "TEXT" : "END",
        text: currentNode[`triggers_${parent}_userReply`]
      },
      scenarioId: ""
  }
}

// TODO system hole: if there are multiple parents, and two of them are fence-triggered,
// which should work?
function getCondition(currentNode, parentNodes, data) {
  const {locations, beacons} = data;
  const conditionTypes = parentNodes.map(p => currentNode[`triggers_${p.id}_conditionType`]).filter(c => c && c !== 'TEXT')
  const conditionType = conditionTypes.length === 0 
    ? 'ALWAYS'
    : conditionTypes[0]
    return {
      type: conditionType,
      beaconId: currentNode.beacon ? beacons[currentNode.beacon].beaconId : null,
      threshold: currentNode.beaconThreshold,
      mode: currentNode.beaconType,
      location: currentNode.geofenceCenter ? locations[currentNode.geofenceCenter] : null,
      radius: currentNode.geofenceRadius || 14
    }
}

function getActions(currentNode, parentsNodes, data) {
  const condition = getCondition(currentNode, parentsNodes, data)
  const {sounds, locations, images} = data;
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
            // ? `${cdnRoot}/${props.record.id}/sounds/${currentNode.soundId}/sound`
            ?  sounds[currentNode.soundId].sound.src || 'http://daqiaotou-storage.floraland.tw/sounds/entrance.mp3'
            : 'http://daqiaotou-storage.floraland.tw/sounds/entrance.mp3',
          volumeSetting: {
            type: currentNode.mode,
            center: currentNode.soundCenterId ? locations[currentNode.soundCenterId] : null,
            fadeOutSeconds: currentNode.fadeOutSeconds,
            speechLength: currentNode.speechLength,
            radius: currentNode.range || 30,
            minVolume: currentNode.minVolume
          },
          mode: currentNode.soundType || 'MAIN',
        },
        condition: condition
      },
      delay: currentNode.soundDelay,
      description: currentNode.name
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
            ? currentNode.pictures.map(p => images[p.pictureId].image.src )
            // ? currentNode.pictures.map(p => `${cdnRoot}/${props.record.id}/images/${p.pictureId}/image`)
            : [],
          allowTextReply: (currentNode.allowTextReply)? true : false,
        },
        condition: condition
      },
      delay: currentNode.popupDelay,
      description: currentNode.name
    }
    ret.push(popupAction)
  }
  if (currentNode.hasIncomingCall) {
    const incomingCallAction = {
      id: currentNode.id + '-incoming-call',
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: 'INCOMING_CALL',
          caller: currentNode.caller,
          portrait: currentNode.portrait
          ? images[currentNode.portrait].image.src
          : null,
          status: currentNode.callStatus
        },
        condition: condition
      },
      delay: currentNode.incomingCallDelay,
      description: currentNode.name
    }
    ret.push(incomingCallAction)
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
            ? images[currentNode.markerIcon].image.src
            // ? `${cdnRoot}/${props.record.id}/images/${currentNode.markerIcon}/image`
            : null,
          location: currentNode.locationId ? locations[currentNode.locationId] : null,
          title: currentNode.title,
          id: currentNode.markerId,
        },
        condition: condition
      },
      delay: currentNode.markerDelay,
      description: currentNode.name
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
          id: currentNode.markerId + '-marker',
        },
        condition: condition
      },
      delay: currentNode.markerRemovalDelay,
      description: currentNode.name
    }
    ret.push(markerRemovalAction)
  }
  if (currentNode.hasPopupDismissal) {
    const popupDismissalAction = {
      id: currentNode.id + '-popup-dismissal',
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: 'POPUP_DISMISSAL',
          destinations: currentNode.dismissalDestinations,
        },
        condition: condition
      },
      delay: currentNode.dismissalDelay,
      description: currentNode.name
    }
    ret.push(popupDismissalAction)
  }
  return ret.map(a => ({
    ...a,
    session: {
      scenario: "",
      chapter: ""
    }
  }))
}

function PublishButton(props) {
  const disabled = useSelector(state => state.currentScenario.value !== props.record.id);
  const notify = useNotify()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const data = getAllData(useGetList);
  const {actions} = data;
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
    
    function getNode(tree) {
      const parents = tree.node.parents ? tree.node.parents.map(p => actions[p]) : []
      const serverActions = getActions(tree.node, parents, data);
      return {
        name: tree.node.firstAction ? 'initial' : tree.node.id,
        children: tree.node.children || [],
        exclusiveWith: (tree.node.exclusiveWith || []).filter(e => e),
        triggers: getTriggers(tree.node, parents),
        performances: serverActions.map(a => ({
          action: a,
          delay: (a.delay === 0 || a.delay) ? a.delay : (tree.node.delay || 0)
        }))
      }
    }

    function getNodes(tree) {
      return tree.children.reduce((agg, c) => 
        [...agg, ...getNodes(c)], [getNode(tree)]
      )
    }
    const payload = getNodes(actionTree)
    const urlString = `https://ghostspeak.floraland.tw/agent/v1/scenario/graphscript/${props.record.id}`
    const url = new URL(urlString)
    const params = {name: props.record.name, overwrite: true}
    url.search = new URLSearchParams(params).toString();
    console.log('payload', payload)

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
        notify("發佈失敗；原因 =" + response.body + " " + response.status)
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

function GpxButton(props) {
  const disabled = useSelector(state => state.currentScenario.value !== props.record.id);
  const notify = useNotify()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const data = getAllData(useGetList);
  const {actions} = data;
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

    function getNode(tree) {
      const parents = tree.node.parents ? tree.node.parents.map(p => actions[p]) : []
      return {
        name: tree.node.firstAction ? 'initial' : tree.node.id,
        children: tree.node.children || [],
        exclusiveWith: tree.node.exclusiveWith || [],
        triggers: getTriggers(tree.node, parents),
        performances: getActions(tree.node, parents, data).map(a => ({
          action: a,
          delay: (a.delay === 0 || a.delay) ? a.delay : (tree.node.delay || 0)
        }))
      }
    }

    function getNodes(tree) {
      return tree.children.reduce((agg, c) => 
        [...agg, ...getNodes(c)], [getNode(tree)]
      )
    }
    const payload = getNodes(actionTree)
    const urlString = `https://ghostspeak.floraland.tw/agent/v1/scenario/graphscript/${props.record.id}`
    const url = new URL(urlString)
    const params = {name: props.record.name, overwrite: true}
    url.search = new URLSearchParams(params).toString();

    const points = payload.map(n => 
      n.performances.map(p => p.action.content.condition).find(c =>
        c.type === 'GEOFENCE'
      )
    ).filter(c => c).map(c => c.location)
    .map(l => new Point(l.lat, l.lon, {ele: 10, time: new Date(), hr: 121}))


    const gpxData = new BaseBuilder()
    const segs = []
    for (var i = 1; i < points.length; i++) {
      segs.push(new Segment([points[i-1], points[i]]))
    }
    const track = new Track(segs, {name: 'main', cmt: 'comment', desc:'desc'})
    gpxData.setWayPoints(points)
    gpxData.setTracks([track])
    const gpx = buildGPX(gpxData.toObject())
    const cleanGpx = gpx.split('\n').filter(l => !l.includes('<time')).join('\n')
    const link = document.createElement('a');
    const blob = new Blob([cleanGpx], {type: 'application/gpx+xml'}); 
    const gpxUrl = window.URL.createObjectURL(blob);
    link.href = gpxUrl;
    link.download = props.record.name  + '.gpx';
    setLoading(false);
    setOpen(false);
    dispatch(fetchEnd());
    link.click();
  }
  return (<>
    <Button
      label="路線檔"
      onClick={handleConfirm}
      disabled={ disabled || loading }
      primary="true"
    />
  </>)
  
}

function Blocker(props) {
  return(
  <Dialog {...props}
    open={props.isOpen}
    aria-labelledby="alert-dialog-title"
  >
    <DialogTitle id="alert-dialog-title">
      複製中
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        請等待複製完成後再繼續操作。
      </DialogContentText>
    </DialogContent>
  </Dialog>
  )
}

function CloneButton(props) {
  const disabled = useSelector(state => state.currentScenario.value !== props.record.id);
  const notify = useNotify()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const {actions, sounds, locations, beacons, images} = getAllData(useGetList)
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
    rootRef: 'ghostspeak_editor/' + createData.id
  }
  const baseProvider = FirebaseDataProvider(config, scenarioOtions)
  const refresh = useRefresh();
  const idMap = new Map()
  Object.keys(actions).forEach(a => idMap.set(a, xid.next()))
  Object.keys(locations).forEach(a => idMap.set(a, xid.next()))
  Object.keys(beacons).forEach(a => idMap.set(a, xid.next()))
  Object.keys(images).forEach(a => idMap.set(a, xid.next()))
  Object.keys(sounds).forEach(a => idMap.set(a, xid.next()))
  async function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    await create()
    
    function createFields(field, fieldName) {
      const values = Object.values(field)
      return values.map(a => {
        const newA = JSON.parse(JSON.stringify(a))
        newA.id = idMap.get(a.id)
        return baseProvider.create(fieldName, {data: newA})
      })
    }

    await Promise.all([ 
      ...createFields(locations, 'locations'),
      ...createFields(beacons, 'beacons'),
      ...createFields(images, 'images'),
      ...createFields(sounds, 'sounds'),
      ...createFields(locations, 'locations'),
    ])
    const actionValues = Object.values(actions)
    await Promise.all(actionValues.map(a => {

      const newA = JSON.parse(JSON.stringify(a))
      newA.id = idMap.get(a.id)
      if (newA.parents) {
        const oldParents = newA.parents
        newA.parents = newA.parents.map(id => idMap.get(id))
        oldParents.map( oldId => {
          const newId = idMap.get(oldId)
          const cond = newA[`triggers_${oldId}_conditionType`];
          newA[`triggers_${newId}_id`] = newId;
          if (cond) {
            delete(newA[`triggers_${oldId}_conditionType`]);
            newA[`triggers_${newId}_conditionType`] = cond;
          }
          const reply = newA[`triggers_${oldId}_userReply`];
          if (reply) {
            delete(newA[`triggers_${oldId}_userReply`]);
            newA[`triggers_${newId}_userReply`] = reply;
          }
        })
      }
      if (newA.exclusiveWith) {
        newA.exclusiveWith = newA.exclusiveWith.map(id => idMap.get(id)).filter(e => e);
      }
      function updateValue(field) {
        const value = newA[field];
        if (value) {
          const newValue = idMap.get(value)
          newA[field] = newValue ? newValue : null
        }
      }
      updateValue('geofenceCenter')
      updateValue('beacon')
      updateValue('soundId')
      updateValue('soundCenterId')
      updateValue('pictureId')
      updateValue('markerIcon')
      updateValue('locationId')
      updateValue('markerId')
      return baseProvider.create('actions', {data: newA})
    }))

    console.log('setloaded')
    setLoading(false);
    setOpen(false);
    notify('複製成功')
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
    <Blocker isOpen={loading}/>
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
      <GpxButton />
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
  const nodesSet = new Set()
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

  function createTree(root) {
    const children = parentMap.get(root.id) || []
    const childNodes = children.map(c => {
      if (nodesSet.has(c.id)) {
        return null
      } else {
        nodesSet.add(c.id)
        return c
      }
    })
    root.children = children.map(c => c.id)
    // console.log('creating tree for child', root.id, children, childNodes)
    // if (!nodesSet.has(root.id)) {
      // nodesSet.add(root.id)
      return {
        node: root,
        children: childNodes.filter(c => c).map(c => createTree(c))
      }
    // } else {
      // return {
        // node: root,
        // children: []
      // }
    // }
  }
  if (initial) return createTree(initial) 
  else return null
}
