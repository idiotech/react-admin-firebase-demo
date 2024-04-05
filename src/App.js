import * as React from "react";
import { ActionList, ActionCreate, ActionEdit } from "./actions";
import {
  ScenarioList,
  ScenarioCreate,
  ScenarioEdit,
  scenarioReducer,
  getActionTree,
} from "./scenarios";
import { LocationList, LocationCreate, LocationEdit } from "./locations";
import { BeaconList, BeaconCreate, BeaconEdit } from "./beacons";
import { ImageList, ImageCreate, ImageEdit } from "./images";
import { SoundList, SoundCreate, SoundEdit } from "./sounds";
import { MapStyleList, MapStyleCreate, MapStyleEdit } from "./mapStyles";
import { BroadcastList, BroadcastCreate, BroadcastEdit } from "./broadcasts";
import { VariableList, VariableCreate, VariableEdit } from "./variables";
import {
  CategoryList,
  CategoryCreate,
  CategoryEdit,
  // CatPublishButton,
} from "./categories";
import { Admin, Resource } from "react-admin";
import { useState, useEffect } from "react";
import {
  FirebaseDataProvider,
  FirebaseAuthProvider,
} from "react-admin-firebase";
import { Provider } from "react-redux";

import CustomLoginPage from "./CustomLoginPage";
import CompositeDataProvider from "./compositeDataProvider";
import { createHashHistory } from "history";
import createAdminStore from "./createAdminStore";

import { firebaseConfig as config } from "./FIREBASE_CONFIG";

import polyglotI18nProvider from "ra-i18n-polyglot"; // install the package
import englishMessages from "ra-language-english"; // install the package

const adminOptions = {
  logging: true,
  rootRef: "ghostspeak_editor/admin",
};

const authProvider = FirebaseAuthProvider(config, adminOptions);

function createAdminDataProvider() {
  return FirebaseDataProvider(config, adminOptions);
}

function getProvider(scenarioId) {
  const scenarioOtions = {
    logging: false,
    rootRef: "ghostspeak_editor/" + scenarioId,
  };
  return FirebaseDataProvider(config, scenarioOtions);
}

const authUrl = process.env.REACT_APP_AUTH_URL || 'https://ghostspeak.floraland.tw/auth';

export function isSuperUser(uid) {
  return fetch(`${authUrl}/user/${uid}/superuser`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  })
    .then((response) => {
      return response.json().then((json) => {
        console.log(uid, "isSuperUser", json);
        return json.result;
      });
    })
    .catch((e) => {
      console.error("failed to detect superuser", e);
      return false;
    });
}

function createAdminProvider() {
  const adminDataProvider = createAdminDataProvider();
  return {
    dataProvider: {
      ...adminDataProvider,
      getList: (resource, params) => {
        if (resource === "scenarios") {
          const baseProvider = getProvider("dummy");
          const authUid = baseProvider.app.auth().currentUser?.uid;
          const authUid2 = baseProvider.app.auth()?._delegate?.currentUser?.uid;
          const localUid = localStorage.getItem("uid");
          // console.log(
          //   "uid",
          //   authUid,
          //   authUid2,
          //   localUid,
          //   baseProvider.app.auth(),
          //   baseProvider.app.auth()._delegate.currentUser
          // );
          const authId = authUid || authUid2;
          if (authId && !localUid) {
            localStorage.setItem("uid", authId);
          }
          const filterUid = authId || localUid || "dead";
          return isSuperUser(filterUid).then((isSuper) => {
            console.log("is super?", isSuper);
            if (!isSuper) {
              params.filter.uid = filterUid;
            }
            return adminDataProvider.getList(resource, params);
          });
        } else if (resource === "categories") {
          // params.sort = { field: "order", order: "ASC" };
          return adminDataProvider.getList(resource, params);
        } else {
          return adminDataProvider.getList(resource, params);
        }
      },
    },
    resources: ["scenarios", "categories"],
  };
}

function createDataProvider(scenario) {
  const scenarioOtions = {
    logging: true,
    rootRef: "ghostspeak_editor/" + scenario,
  };
  const baseProvider = FirebaseDataProvider(config, scenarioOtions);
  return {
    dataProvider: {
      ...baseProvider,
      getList: (resource, params) => {
        function getActionList() {
          const newParams = JSON.parse(JSON.stringify(params));
          newParams.pagination.page = 1;
          newParams.pagination.perPage = 10000;
          return baseProvider.getList(resource, newParams).then((list) => {
            const actions = list.data;

            const actionTree = getActionTree(actions);
            function getMembers(tree) {
              return tree.children.reduce(
                (agg, c) => [...agg, ...getMembers(c)],
                [tree.node]
              );
            }
            if (actionTree) {
              const members = getMembers(actionTree);
              const memberIds = new Set(members.map((m) => m.id));
              const page = params.pagination.page - 1;
              const perPage = params.pagination.perPage;
              const data = [
                ...members,
                ...list.data.filter((n) => !memberIds.has(n.id)),
              ];
              data.forEach((e, index) => {
                e.rowIndex = index + 1;
                e.sorted = true;
                const key = `a-${e.id}`;
                localStorage.setItem(key, e.rowIndex);
              });
              return {
                data: data.slice(page * perPage, (page + 1) * perPage),
                total: list.data.length,
              };
            } else return list;
          });
        }
        return resource !== "actions"
          ? baseProvider.getList(resource, params).then((r) => {
              r.data.forEach((e, index) => {
                e.rowIndex = index + 1;
              });
              return r;
            })
          : getActionList();
      },
    },
    resources: [
      "locations",
      "actions",
      "nodes",
      "beacons",
      "images",
      "sounds",
      "mapStyles",
      "broadcasts",
      "variables",
    ],
    name: scenario,
  };
}

const dataProvider = new CompositeDataProvider([
  createAdminProvider(),
  createDataProvider("test"),
]);

const customReducers = { currentScenario: scenarioReducer };

const history = createHashHistory();
function Main() {
  const i18nProvider = polyglotI18nProvider(() => englishMessages, "en", {
    allowMissing: true,
    onMissingKey: (key) => key,
  });
  // localStorage.removeItem('scenario')
  const baseProvider = getProvider("dummy");
  const authUid = baseProvider.app.auth().currentUser?.uid;
  const authUid2 = baseProvider.app.auth()?._delegate?.currentUser?.uid;
  const authId = authUid || authUid2;
  const localUid = localStorage.getItem("uid");
  const filterUid = authId || localUid || "dead";
  // const isSuper = await isSuperUser(filterUid);

  const [isSuper, setIsSuper] = useState(false);
  useEffect(() => {
    isSuperUser(filterUid).then((s) => {
      setIsSuper(s);
    });
  }, []);
  console.log("is super?", isSuper);
  return (
    <Admin
      loginPage={CustomLoginPage}
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      history={history}
      customReducers={customReducers}
    >
      <Resource
        name="scenarios"
        options={{ label: "劇本" }}
        list={ScenarioList}
        create={ScenarioCreate}
        edit={ScenarioEdit}
      />
      {isSuper ? (
        <Resource
          name="categories"
          options={{ label: "分類" }}
          list={CategoryList}
          create={CategoryCreate}
          edit={CategoryEdit}
        />
      ) : (
        <Resource name="categories" />
      )}
      <Resource
        name="images"
        options={{ label: "圖片" }}
        list={ImageList}
        create={ImageCreate}
        edit={ImageEdit}
      />
      <Resource
        name="sounds"
        options={{ label: "聲音" }}
        list={SoundList}
        create={SoundCreate}
        edit={SoundEdit}
      />
      <Resource
        name="beacons"
        options={{ label: "Beacon" }}
        list={BeaconList}
        create={BeaconCreate}
        edit={BeaconEdit}
      />
      <Resource
        name="locations"
        options={{ label: "地點" }}
        list={LocationList}
        create={LocationCreate}
        edit={LocationEdit}
      />
      <Resource
        name="mapStyles"
        options={{ label: "地圖樣式" }}
        list={MapStyleList}
        create={MapStyleCreate}
        edit={MapStyleEdit}
      />
      <Resource
        name="variables"
        options={{ label: "變數" }}
        list={VariableList}
        create={VariableCreate}
        edit={VariableEdit}
      />
      <Resource
        name="actions"
        options={{ label: "動作" }}
        list={ActionList}
        create={ActionCreate}
        edit={ActionEdit}
      />
      <Resource
        name="broadcasts"
        options={{ label: "廣播" }}
        list={BroadcastList}
        create={BroadcastCreate}
        edit={BroadcastEdit}
      />
    </Admin>
  );
}

var prevScenario = null;

function App() {
  const adminProvider = createAdminProvider();
  const store = createAdminStore({
    authProvider,
    dataProvider,
    history,
    customReducers,
  });
  const storedScenario = localStorage.getItem("scenario");
  document.title = "Urban Baker街區編輯器";
  console.log("initial scenario", storedScenario);
  if (storedScenario) {
    console.log("setting initial data provider", storedScenario);
    dataProvider.dataProviders = [
      adminProvider,
      createDataProvider(storedScenario),
    ];
    prevScenario = storedScenario;
  }
  store.subscribe(() => {
    const scenario = store.getState().currentScenario.value;
    if (scenario && scenario !== prevScenario) {
      console.log("setting data provider", store.getState());
      dataProvider.dataProviders = [
        adminProvider,
        createDataProvider(scenario),
      ];
      prevScenario = scenario;
    }
  });
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

export default App;
