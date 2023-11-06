import { firebaseConfig as config } from "./FIREBASE_CONFIG";
import { FirebaseDataProvider } from "react-admin-firebase";

class CompositeDataProvider {
  constructor(dataProviders) {
    this.time = Date.now();
    this.dataProviders = dataProviders;
  }

  _delegate(name, resource, params) {
    const { dataProvider } = this.dataProviders.find((dp) =>
      dp.resources.includes(resource)
    );
    return dataProvider[name](resource, params);
  }

  getList(resource, params) {
    return this._delegate("getList", resource, params);
  }
  getOne(resource, params) {
    return this._delegate("getOne", resource, params);
  }
  getMany(resource, params) {
    return this._delegate("getMany", resource, params);
  }
  getManyReference(resource, params) {
    return this._delegate("getManyReference", resource, params);
  }
  create(resource, params) {
    if (resource == "scenarios") {
      params.data.ordinal = Date.now();
      return this._delegate("create", resource, params).then((r) => {
        if (!params.data.cloned) {
          const defaultImage = {
            data: {
              image: {
                src: "https://storage.googleapis.com/daqiaotou/images/default-marker.png",
                name: "default-marker.png",
              },
              name: "預設圖釘",
            },
          };
          const scenario = r.data.id;
          const scenarioOtions = {
            logging: true,
            rootRef: "ghostspeak_editor/" + scenario,
          };
          const tempProvider = FirebaseDataProvider(config, scenarioOtions);
          return tempProvider.create("images", defaultImage).then(() => r);
        } else return Promise.resolve(r);
      });
    } else {
      return this._delegate("create", resource, params);
    }
  }
  update(resource, params) {
    return this._delegate("update", resource, params);
  }
  updateMany(resource, params) {
    return this._delegate("updateMany", resource, params);
  }
  delete(resource, params) {
    return this._delegate("delete", resource, params);
  }
  deleteMany(resource, params) {
    return this._delegate("deleteMany", resource, params);
  }
}

export default CompositeDataProvider;
