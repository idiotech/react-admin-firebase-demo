import * as React from "react";
import { firebaseConfig as config } from "./FIREBASE_CONFIG";

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
  useRefresh,
  useNotify,
  fetchStart,
  fetchEnd,
  Confirm,
  useMutation,
  BooleanField,
  BooleanInput,
  NumberInput,
} from "react-admin";
import { createStore } from "redux";
import { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSelector, useDispatch } from "react-redux";
import { FirebaseDataProvider } from "react-admin-firebase";
import * as xid from "xid-js";

import { getRecordField } from "./utils";

import { useAllData, getActions } from "./serverCommon";

export function scenarioReducer(state = { value: "" }, action) {
  switch (action.type) {
    case "setScenario":
      return { value: action.scenario };
    default:
      return state;
  }
}

import { buildGPX, BaseBuilder } from "gpx-builder";
const { Point, Track, Segment } = BaseBuilder.MODELS;

const store = createStore(scenarioReducer);

store.subscribe(() => console.log("listener", store.getState()));

const ScenarioFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);
// const cdnRoot = "http://daqiaotou-storage.floraland.tw/ghostspeak_editor";

function isCurrentScenario(props) {
  if (props && props.record) {
    return (
      useSelector((state) => state.currentScenario.value === props.record.id) ||
      localStorage.getItem("scenario") === props.record.id
    );
  } else {
    return false;
  }
}

function UseButton(props) {
  const active = isCurrentScenario(props);
  const dispatch = useDispatch();
  const refresh = useRefresh();
  function handleClick() {
    const scenario = getRecordField(props, "id");
    localStorage.setItem("scenario", scenario);
    localStorage.setItem("scenarioName", getRecordField(props, "name"));
    dispatch({ type: "setScenario", scenario: scenario });
    refresh();
  }
  return (
    <Button
      label="設定為目前劇本"
      onClick={handleClick}
      disabled={active}
      primary="true"
    />
  );
}

function getTriggers(currentNode, parents) {
  if (currentNode.firstAction) {
    return [
      {
        id: "",
        actionId: null,
        receiver: "ghost",
        sender: "?u",
        payload: {
          type: "JOIN",
        },
        scenarioId: "",
      },
    ];
  } else {
    const ret = parents.flatMap((p) => getTriggerList(currentNode, p));
    return ret.filter((value, index) => {
      const _value = JSON.stringify(value);
      return (
        index ===
        ret.findIndex((obj) => {
          return JSON.stringify(obj) === _value;
        })
      );
    });
  }
}

function getTriggerList(currentNode, parentNode) {
  return currentNode.prevs
    .filter((p) => p.prev == parentNode.id)
    .map((condition) => {
      if (!condition) {
        console.log(
          "bad parent",
          currentNode.name,
          parentNode.name,
          parentNode.id,
          currentNode.prevs.map((p) => p.prev)
        );
      }
      const actionId =
        condition.conditionType === "TEXT"
          ? parentNode.id + "-popup"
          : parentNode.hasSound &&
            (parentNode.soundType == "MAIN" || !parentNode.soundType)
          ? parentNode.id + "-sound"
          : parentNode.hasPopup
          ? parentNode.id + "-popup"
          : parentNode.hasIncomingCall
          ? parentNode.id + "-incoming-call"
          : parentNode.hasHangUp
          ? parentNode.id + "-hang-up"
          : parentNode.hasMarker
          ? parentNode.id + "-marker"
          : parentNode.hasMarkerRemoval
          ? parentNode.id + "-marker-removal"
          : parentNode.hasMapStyle
          ? parentNode.id + "-map-style"
          : parentNode.hasGuideImage
          ? parentNode.id + "-guide-image"
          : parentNode.hasPopupDismissal
          ? parentNode.id + "-popup-dismissal"
          : parentNode.hasIntroImage
          ? parentNode.id + "-intro-image"
          : parentNode.hasSound && parentNode.soundType == "BACKGROUND"
          ? parentNode.id + "-sound"
          : parentNode.id + "-button-style";
      return {
        id: "",
        actionId: actionId,
        receiver: "ghost",
        sender: "?u",
        payload: {
          type: condition.conditionType === "TEXT" ? "TEXT" : "END",
          text: condition.fallback ? "fallback:" : condition.userReply,
        },
        scenarioId: "",
      };
    });
}

// TODO: system hole
// only one condition holds
function getCondition(currentNode, data) {
  const { locations, beacons } = data;
  const active =
    currentNode.prevs &&
    currentNode.prevs.find((p) => p.conditionType != "TEXT" && p.conditionType);
  if (active) {
    return {
      type: active.conditionType,
      beaconId: active.beacon ? beacons[active.beacon].beaconId : null,
      threshold: active.beaconThreshold,
      mode: active.beaconType,
      location: active.geofenceCenter ? locations[active.geofenceCenter] : null,
      radius: active.geofenceRadius || 14,
    };
  } else {
    return { type: "ALWAYS" };
  }
}

const isSuperUser =
  localStorage.getItem("uid") === process.env.REACT_APP_SUPER_USER;

console.log("REACT_APP_SUPER_USER", process.env.REACT_APP_SUPER_USER);

function PublishButton(props) {
  const disabled = !isCurrentScenario(props);
  const notify = useNotify();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const data = useAllData();
  const { actions, variables } = data;
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    const actionTree = getActionTree(Object.values(actions));
    if (!actionTree) {
      setLoading(false);
      setOpen(false);
      dispatch(fetchEnd());
      notify("沒有初始動作，無法發佈！", "error");
      return;
    }

    function getNode(tree) {
      const parents = tree.node.prevs
        ? tree.node.prevs.map((p) => actions[p.prev])
        : [];
      const condition = getCondition(tree.node, data);
      const serverActions = getActions(tree.node, data, condition);
      const isFirst = tree.node.firstAction;
      return {
        name: isFirst ? "initial" : tree.node.id,
        children: tree.node.children || [],
        exclusiveWith: (tree.node.exclusiveWith || []).filter((e) => e),
        triggers: getTriggers(tree.node, parents),
        performances: serverActions.map((a) => ({
          action: a,
          delay: a.delay === 0 || a.delay ? a.delay : 0,
        })),
        preconditions: tree.node.preconditions?.map((p) => ({
          name: variables[p.variable]?.name,
          comparison: p.comparison,
          value: p.value,
        })),
      };
    }

    function getNodes(tree) {
      return tree.children.reduce(
        (agg, c) => [...agg, ...getNodes(c)],
        [getNode(tree)]
      );
    }
    try {
      const payload = getNodes(actionTree);
      const urlString = `https://ghostspeak.floraland.tw/agent/v1/scenario/graphscript/${getRecordField(
        props,
        "id"
      )}`;
      const url = new URL(urlString);
      const displayName = getRecordField(props, "displayName") || null;
      const params = {
        name: getRecordField(props, "name"),
        displayName: displayName,
        overwrite: true,
        public: getRecordField(props, "public"),
        owner: getRecordField(props, "owner") || null,
        ordinal: getRecordField(props, "ordinal") || Date.now(),
      };
      url.search = new URLSearchParams(params).toString();
      console.log("payload", payload);

      fetch(url, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
          "content-type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            notify("成功發佈" + getRecordField(props, "name"), "success");
          } else {
            notify(
              "發佈失敗；原因 =" + response.body + " " + response.status,
              "error"
            );
          }
        })
        .catch((e) => {
          notify("發佈失敗；原因 =" + e, "error");
        })
        .finally(() => {
          setLoading(false);
          setOpen(false);
          dispatch(fetchEnd());
        });
    } catch (e) {
      notify(e, "error");
      setLoading(false);
      setOpen(false);
      dispatch(fetchEnd());
    }
  }

  return (
    <>
      <Button
        label="發佈"
        onClick={handleClick}
        disabled={disabled || loading}
        primary="true"
      />
      <Confirm
        isOpen={open}
        title="確認發佈"
        content={`你即將發佈${getRecordField(
          props,
          "name"
        )}；使用者的進度將被中斷。確定嗎？`}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        confirm="確認發佈"
        cancel="取消"
      />
    </>
  );
}

function UnpublishButton(props) {
  const disabled = !isCurrentScenario(props);
  const notify = useNotify();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const [open, setOpen] = useState(false);
  function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    const urlString = `https://ghostspeak.floraland.tw/agent/v1/scenario/graphscript/${getRecordField(
      props,
      "id"
    )}`;
    const url = new URL(urlString);
    fetch(url, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          notify("成功解除發佈" + getRecordField(props, "name"), "success");
        } else {
          notify(
            "解除發佈失敗；原因 =" + response.body + " " + response.status,
            "error"
          );
        }
      })
      .catch((e) => {
        notify("解除發佈失敗；原因 =" + e, "error");
      })
      .finally(() => {
        setLoading(false);
        setOpen(false);
        dispatch(fetchEnd());
      });
  }

  return (
    <>
      <Button
        label="解除發佈"
        onClick={handleClick}
        disabled={disabled || loading}
        primary="true"
      />
      <Confirm
        isOpen={open}
        title="確認解除發佈"
        content={`你即將解除發佈${getRecordField(
          props,
          "name"
        )}；用戶將無法使用。確定嗎？`}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        confirm="確認解除發佈"
        cancel="取消"
      />
    </>
  );
}

function GpxButton(props) {
  const disabled = !isCurrentScenario(props);
  const notify = useNotify();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const data = useAllData();
  const { actions } = data;
  const [open, setOpen] = useState(false);
  open;
  function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    const actionTree = getActionTree(Object.values(actions));
    if (!actionTree) {
      setLoading(false);
      setOpen(false);
      dispatch(fetchEnd());
      notify("沒有初始動作，無法發佈！");
      return;
    }

    function getNode(tree) {
      const parents = tree.node.parents
        ? tree.node.parents.map((p) => actions[p])
        : [];
      const condition = getCondition(tree.node, data);
      return {
        name: tree.node.firstAction ? "initial" : tree.node.id,
        children: tree.node.children || [],
        exclusiveWith: tree.node.exclusiveWith || [],
        triggers: getTriggers(tree.node, parents),
        performances: getActions(tree.node, data, condition).map((a) => ({
          action: a,
          delay: a.delay === 0 || a.delay ? a.delay : tree.node.delay || 0,
        })),
      };
    }

    function getNodes(tree) {
      return tree.children.reduce(
        (agg, c) => [...agg, ...getNodes(c)],
        [getNode(tree)]
      );
    }
    try {
      const payload = getNodes(actionTree);
      const urlString = `https://ghostspeak.floraland.tw/agent/v1/scenario/graphscript/${getRecordField(
        props,
        "id"
      )}`;
      const url = new URL(urlString);
      const params = { name: getRecordField(props, "name"), overwrite: true };
      url.search = new URLSearchParams(params).toString();

      const points = payload
        .map((n) =>
          n.performances
            .map((p) => p.action.content.condition)
            .find((c) => c.type === "GEOFENCE")
        )
        .filter((c) => c)
        .map((c) => c.location)
        .map(
          (l) => new Point(l.lat, l.lon, { ele: 10, time: new Date(), hr: 121 })
        );

      const gpxData = new BaseBuilder();
      const segs = [];
      for (var i = 1; i < points.length; i++) {
        segs.push(new Segment([points[i - 1], points[i]]));
      }
      const track = new Track(segs, {
        name: "main",
        cmt: "comment",
        desc: "desc",
      });
      gpxData.setWayPoints(points);
      gpxData.setTracks([track]);
      const gpx = buildGPX(gpxData.toObject());
      const cleanGpx = gpx
        .split("\n")
        .filter((l) => !l.includes("<time"))
        .join("\n");
      const link = document.createElement("a");
      const blob = new Blob([cleanGpx], { type: "application/gpx+xml" });
      const gpxUrl = window.URL.createObjectURL(blob);
      link.href = gpxUrl;
      link.download = getRecordField(props, "name") + ".gpx";
      setLoading(false);
      setOpen(false);
      dispatch(fetchEnd());
      link.click();
    } catch (e) {
      notify(e, "error");
      setLoading(false);
      setOpen(false);
      dispatch(fetchEnd());
    }
  }
  return (
    <>
      <Button
        label="路線檔"
        onClick={handleConfirm}
        disabled={disabled || loading}
        primary="true"
      />
    </>
  );
}

function Blocker(props) {
  return (
    <Dialog {...props} open={props.isOpen} aria-labelledby="alert-dialog-title">
      <DialogTitle id="alert-dialog-title">複製中</DialogTitle>
      <DialogContent>
        <DialogContentText>請等待複製完成後再繼續操作。</DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

function getProvider(scenarioId) {
  const scenarioOtions = {
    logging: false,
    rootRef: "ghostspeak_editor/" + scenarioId,
  };
  return FirebaseDataProvider(config, scenarioOtions);
}

// NPke29IzKoLgFMZRm2Hc

function CloneButton(props) {
  const disabled = !isCurrentScenario(props);
  const notify = useNotify();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const {
    actions,
    sounds,
    locations,
    beacons,
    images,
    mapStyles,
    broadcasts,
    variables,
  } = useAllData();
  const createData = JSON.parse(JSON.stringify(props.record));
  const cloneId = xid.next();
  createData.id = cloneId;
  createData.name = getRecordField(props, "name") + "-" + cloneId;
  createData.cloned = true;
  const [create] = useMutation({
    type: "create",
    resource: "scenarios",
    payload: { data: createData },
  });
  const baseProvider = getProvider(createData.id);
  // TODO copy UID
  const refresh = useRefresh();
  const idMap = new Map();
  Object.keys(actions).forEach((a) => idMap.set(a, xid.next()));
  Object.keys(locations).forEach((a) => idMap.set(a, xid.next()));
  Object.keys(beacons).forEach((a) => idMap.set(a, xid.next()));
  Object.keys(images).forEach((a) => idMap.set(a, xid.next()));
  Object.keys(sounds).forEach((a) => idMap.set(a, xid.next()));
  Object.keys(mapStyles).forEach((a) => idMap.set(a, xid.next()));
  Object.keys(broadcasts).forEach((a) => idMap.set(a, xid.next()));
  Object.keys(variables).forEach((a) => idMap.set(a, xid.next()));
  async function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    await create();

    function createFields(field, fieldName) {
      const values = Object.values(field);
      return values.map((a) => {
        const newA = JSON.parse(JSON.stringify(a));
        newA.id = idMap.get(a.id);
        return baseProvider.create(fieldName, { data: newA });
      });
    }

    await Promise.all([
      ...createFields(locations, "locations"),
      ...createFields(beacons, "beacons"),
      ...createFields(images, "images"),
      ...createFields(sounds, "sounds"),
      ...createFields(mapStyles, "mapStyles"),
      ...createFields(locations, "locations"),
      ...createFields(variables, "variables"),
    ]);
    function updateValueFor(obj, field) {
      const value = obj[field];
      if (value) {
        const newValue = idMap.get(value);
        obj[field] = newValue ? newValue : null;
      }
    }
    function updateValuesFor(a) {
      updateValueFor(a, "geofenceCenter");
      updateValueFor(a, "beacon");
      updateValueFor(a, "soundId");
      updateValueFor(a, "mapStyle");
      updateValueFor(a, "soundCenterId");
      updateValueFor(a, "markerIcon");
      updateValueFor(a, "portrait");
      updateValueFor(a, "locationId");
      updateValueFor(a, "markerId");
      updateValueFor(a, "introBackground");
      updateValueFor(a, "introLogo");
      updateValueFor(a, "mapLogo");
      updateValueFor(a, "variable");
      updateValueFor(a, "guideImage");
      updateValueFor(a, "silencedSound");
      if (a.variableUpdates) {
        a.variableUpdates.forEach((u) => {
          updateValuesFor(u, "name");
        });
      }
      if (a.preconditions) {
        a.preconditions.forEach((p) => {
          updateValuesFor(p, "variable");
        });
      }
      if (a.pictures) {
        a.pictures.forEach((p) => {
          const newId = idMap.get(p.pictureId);
          p.pictureId = newId;
        });
      }
    }
    await Promise.all(
      Object.values(broadcasts).map((a) => {
        const newA = JSON.parse(JSON.stringify(a));
        newA.id = idMap.get(a.id);
        updateValuesFor(newA);
        return baseProvider.create("broadcasts", { data: newA });
      })
    );
    await Promise.all(
      Object.values(actions).map((a) => {
        const newA = JSON.parse(JSON.stringify(a));
        newA.id = idMap.get(a.id);
        if (newA.exclusiveWith) {
          newA.exclusiveWith = newA.exclusiveWith
            .map((id) => idMap.get(id))
            .filter((e) => e);
        }
        updateValuesFor(newA);
        // for new formats
        if (newA.prevs) {
          newA.prevs.forEach((p) => {
            updateValueFor(p, "prev");
            updateValueFor(p, "beacon");
            updateValueFor(p, "geofenceCenter");
          });
        }
        // for old formats
        else if (newA.parents) {
          const oldParents = newA.parents;
          newA.parents = newA.parents.map((id) => idMap.get(id));
          const prevs = oldParents.map((oldId) => {
            const newId = idMap.get(oldId);
            const cond = newA[`triggers_${oldId}_conditionType`];
            const rec = {};
            rec.prev = newId;
            newA[`triggers_${newId}_id`] = newId;
            if (cond) {
              delete newA[`triggers_${oldId}_conditionType`];
              rec.conditionType = cond;
            }
            if (cond === "BEACON") {
              rec.beacon = newA.beacon;
              rec.beaconThreshold = newA.beaconThreshold;
              rec.beaconType = newA.beaconType;
            }
            if (cond === "GEOFENCE") {
              rec.geofenceCenter = newA.geofenceCenter;
              rec.geofenceRadius = newA.geofenceRadius || 14;
            }
            const reply = newA[`triggers_${oldId}_userReply`];
            if (reply) {
              delete newA[`triggers_${oldId}_userReply`];
              rec.userReply = reply;
            }
            const fallback = newA[`triggers_${oldId}_fallback`];
            if (fallback) {
              delete newA[`triggers_${oldId}_fallback`];
              rec.fallback = fallback;
            }
            return rec;
          });
          newA.prevs = prevs;
        }
        return baseProvider.create("actions", { data: newA });
      })
    );

    setLoading(false);
    setOpen(false);
    notify("複製成功", "success");
    dispatch(fetchEnd());
    refresh();
  }

  return (
    <>
      <Button
        label="複製"
        onClick={handleClick}
        disabled={disabled || loading}
        primary="true"
      />
      <Confirm
        isOpen={open}
        title="確認複製"
        content={`你即將複製一份《${getRecordField(props, "name")}》；確定嗎？`}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        confirm="確認複製"
        cancel="取消"
      />
      <Blocker isOpen={loading} />
    </>
  );
}

const Title = ({ record }) => {
  return <span>劇本{record && record.name ? `：${record.name}` : ""}</span>;
};

export const ScenarioList = (props) => {
  return (
    <List
      title={<Title />}
      {...props}
      sort={{ field: "ordinal", order: "ASC" }}
      perPage={20}
      filters={<ScenarioFilter />}
    >
      <Datagrid>
        <TextField label="名稱" source="name" />
        <TextField label="說明" source="description" />
        <BooleanField label="正式上架" source="public" />
        <UseButton />
        <PublishButton />
        <UnpublishButton />
        <CloneButton />
        <GpxButton />
        <EditButton label="" />
        <DeleteButton label="" redirect={false} />
      </Datagrid>
    </List>
  );
};

export const ScenarioCreate = (props) => {
  const baseProvider = getProvider("dummy");
  const anotherUid = baseProvider.app.auth().currentUser?.uid || "dead";
  return (
    <Create title={<Title />} {...props}>
      <SimpleForm>
        <TextInput label="名稱" source="name" />
        <TextInput label="顯示名稱" source="displayName" />
        <TextInput label="說明" source="description" />
        <TextInput
          label="User ID"
          source="uid"
          disabled
          initialValue={anotherUid}
        />
        <BooleanInput
          label="正式上架"
          source="public"
          disabled={!isSuperUser}
        />
      </SimpleForm>
    </Create>
  );
};

export const ScenarioEdit = (props) => {
  const baseProvider = getProvider("dummy");
  const uid = baseProvider.app.auth().currentUser?.uid || "dead";
  return (
    <Edit title={<Title />} {...props}>
      <SimpleForm>
        <TextInput disabled source="id" />
        <TextInput label="名稱" source="name" />
        <TextInput label="顯示名稱" source="displayName" />
        <TextInput label="說明" source="description" />
        <NumberInput label="順序" source="ordinal" initialValue={Date.now()} />
        <BooleanInput
          label="正式上架"
          source="public"
          disabled={!isSuperUser}
        />
        <TextInput label="專輯" source="owner" disabled={!isSuperUser} />
        <DateTimeInput label="建立時間" disabled source="createdate" />
        <DateTimeInput label="修改時間" disabled source="lastupdate" />
        <TextInput label="user id" source="uid" disabled initialValue={uid} />
      </SimpleForm>
    </Edit>
  );
};

export function getActionTree(actions) {
  const initial = actions.find((a) => a.firstAction);
  const nodesSet = new Set();
  const parentMap = actions.reduce(function (m, a) {
    if (a.prevs) {
      a.prevs.forEach((p) => {
        const orig = m.get(p.prev) || [];
        m.set(p.prev, [...orig, a]);
      });
      return m;
    } else {
      return m;
    }
  }, new Map());

  function createTree(root) {
    const children = parentMap.get(root.id) || [];
    const childNodes = children.map((c) => {
      if (nodesSet.has(c.id)) {
        return null;
      } else {
        nodesSet.add(c.id);
        return c;
      }
    });
    root.children = children.map((c) => c.id);
    const treeChildren = childNodes.filter((c) => c).map((c) => createTree(c));
    treeChildren.sort((a, b) => a.children.length > b.children.length);
    return {
      node: root,
      children: treeChildren,
    };
  }
  if (initial) return createTree(initial);
  else return null;
}
