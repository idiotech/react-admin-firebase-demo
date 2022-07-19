import { useGetList } from "react-admin";

export const useAllData = () => {
  const actionResult = useGetList(
    "actions",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const actions = actionResult.data;

  const locationResult = useGetList(
    "locations",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const locations = locationResult.data;

  const beaconResult = useGetList(
    "beacons",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const beacons = beaconResult.data;

  const imageResult = useGetList(
    "images",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const images = imageResult.data;

  const soundResult = useGetList(
    "sounds",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const sounds = soundResult.data;

  const mapStyleResult = useGetList(
    "mapStyles",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const mapStyles = mapStyleResult.data;
  const broadcastResult = useGetList(
    "broadcasts",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const broadcasts = broadcastResult.data;
  const variableResult = useGetList(
    "variables",
    { page: 1, perPage: 500 },
    { field: "published_at", order: "DESC" }
  );
  const variables = variableResult.data;
  return {
    actions,
    locations,
    beacons,
    images,
    sounds,
    mapStyles,
    broadcasts,
    variables,
  };
};

export const getActions = (currentNode, data, condition) => {
  const { sounds, locations, images, mapStyles, variables } = data;
  const ret = [];
  if (currentNode.hasSound) {
    const soundAction = {
      id: currentNode.id + "-sound",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "SOUND",
          url: currentNode.soundId
            ? // ? `${cdnRoot}/${props.record.id}/sounds/${currentNode.soundId}/sound`
              sounds[currentNode.soundId].sound.src ||
              "http://daqiaotou-storage.floraland.tw/sounds/entrance.mp3"
            : "http://daqiaotou-storage.floraland.tw/sounds/entrance.mp3",
          volumeSetting: {
            type: currentNode.mode || "STATIC_VOLUME",
            center: currentNode.soundCenterId
              ? locations[currentNode.soundCenterId]
              : null,
            fadeOutSeconds: currentNode.fadeOutSeconds,
            speechLength: currentNode.speechLength,
            radius: currentNode.range || 30,
            minVolume: currentNode.minVolume,
          },
          mode: currentNode.soundType || "MAIN",
        },
        condition: condition,
      },
      delay: currentNode.soundDelay,
      description: currentNode.name,
    };
    ret.push(soundAction);
  }
  if (currentNode.hasPopup) {
    const popupAction = {
      id: currentNode.id + "-popup",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "POPUP",
          destinations: currentNode.destinations,
          text: currentNode.text,
          choices: currentNode.choices
            ? currentNode.choices.map((c) => c.choice)
            : [],
          pictures: currentNode.pictures
            ? currentNode.pictures.map((p) => images[p.pictureId].image.src)
            : // ? currentNode.pictures.map(p => `${cdnRoot}/${props.record.id}/images/${p.pictureId}/image`)
              [],
          allowTextReply: currentNode.allowTextReply ? true : false,
        },
        condition: condition,
      },
      delay: currentNode.popupDelay,
      description: currentNode.name,
    };
    ret.push(popupAction);
  }
  if (currentNode.hasIncomingCall) {
    const incomingCallAction = {
      id: currentNode.id + "-incoming-call",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "INCOMING_CALL",
          caller: currentNode.caller,
          portrait: currentNode.portrait
            ? images[currentNode.portrait].image.src
            : null,
          status: currentNode.callStatus,
        },
        condition: condition,
      },
      delay: currentNode.incomingCallDelay,
      description: currentNode.name,
    };
    ret.push(incomingCallAction);
  }
  if (currentNode.hasHangUp) {
    const hangUpAction = {
      id: currentNode.id + "-hang-up",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "INCOMING_CALL",
          caller: currentNode.caller,
          portrait: currentNode.portrait
            ? images[currentNode.portrait].image.src
            : null,
          status: "DISCONNECTED",
        },
        condition: condition,
      },
      delay: currentNode.hangUpDelay,
      description: currentNode.name,
    };
    ret.push(hangUpAction);
  }
  if (currentNode.hasMarker) {
    const markerAction = {
      id: currentNode.id + "-marker",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "MARKER",
          icon: currentNode.markerIcon
            ? images[currentNode.markerIcon].image.src
            : // ? `${cdnRoot}/${props.record.id}/images/${currentNode.markerIcon}/image`
              null,
          location: currentNode.locationId
            ? locations[currentNode.locationId]
            : null,
          title: currentNode.title,
          id: currentNode.markerId,
        },
        condition: condition,
      },
      delay: currentNode.markerDelay,
      description: currentNode.name,
    };
    ret.push(markerAction);
  }
  if (currentNode.hasMarkerRemoval) {
    const markerRemovalAction = {
      id: currentNode.id + "-marker-removal",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "MARKER_REMOVAL",
          id: currentNode.markerId + "-marker",
        },
        condition: condition,
      },
      delay: currentNode.markerRemovalDelay,
      description: currentNode.name,
    };
    ret.push(markerRemovalAction);
  }
  if (currentNode.hasPopupDismissal) {
    const popupDismissalAction = {
      id: currentNode.id + "-popup-dismissal",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "POPUP_DISMISSAL",
          destinations: currentNode.dismissalDestinations,
        },
        condition: condition,
      },
      delay: currentNode.dismissalDelay,
      description: currentNode.name,
    };
    ret.push(popupDismissalAction);
  }
  if (currentNode.hasMapStyle) {
    const mapStyleAction = {
      id: currentNode.id + "-map-style",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "MAP_STYLE",
          url: currentNode.satellite
            ? null
            : currentNode.mapStyle
            ? mapStyles[currentNode.mapStyle]?.mapStyle.src
            : null,
          satellite: currentNode.satellite,
        },
        condition: condition,
      },
      delay: currentNode.mapStyleDelay,
      description: currentNode.name,
    };
    ret.push(mapStyleAction);
  }
  if (currentNode.hasIntroImage) {
    const introImageAction = {
      id: currentNode.id + "-intro-image",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "INTRO_IMAGE",
          backgroundUrl: currentNode.introBackground
            ? images[currentNode.introBackground]?.image.src
            : null,
          logoUrl: currentNode.introLogo
            ? images[currentNode.introLogo]?.image.src
            : null,
          mapLogoUrl: currentNode.mapLogo
            ? images[currentNode.mapLogo]?.image.src
            : null,
          logoMarginTop: currentNode.introLogoMarginTop,
          logoWidth: currentNode.introLogoWidth,
          logoHeight: currentNode.introLogoHeight,
        },
        condition: condition,
      },
      delay: currentNode.introImageDelay,
      description: currentNode.name,
    };
    ret.push(introImageAction);
  }
  if (currentNode.hasButtonStyle) {
    const buttonStyleAction = {
      id: currentNode.id + "-button-style",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "BUTTON_STYLE",
          textColor: currentNode.textColor,
          backgroundColor: currentNode.backgroundColor,
        },
        condition: condition,
      },
      delay: currentNode.backgroundDelay,
      description: currentNode.name,
    };
    ret.push(buttonStyleAction);
  }
  if (currentNode.hasVariableUpdate) {
    const variableUpdates = currentNode.variableUpdates.map((vu) => ({
      name: vu.variable ? variables[vu.variable]?.name : null,
      operation: vu.operation,
      value: vu.value,
    }));

    const variableAction = {
      id: currentNode.id + "-variable-update" + "",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "VARIABLE_UPDATES",
          updates: variableUpdates,
        },
        condition: condition,
      },
      description: currentNode.name,
    };
    ret.push(variableAction);
  }
  if (currentNode.firstAction) {
    const updates = [];
    for (const key in variables) {
      const v = variables[key];
      updates.push({
        name: v.name,
        operation: "=",
        value: v.value,
      });
    }
    const variableAction = {
      id: currentNode.id + "-variable-default" + "",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "VARIABLE_UPDATES",
          updates: updates,
        },
        condition: condition,
      },
      description: currentNode.name,
    };
    ret.push(variableAction);
  }
  return ret.map((a) => ({
    ...a,
    session: {
      scenario: "",
      chapter: "",
    },
  }));
};
