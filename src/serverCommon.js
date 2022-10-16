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
  // if (currentNode.hasSound && !sounds[currentNode.soundId]) {
  //   console.log("bad sound:", currentNode.name);
  // }
  if (currentNode.hasSound && !sounds[currentNode.soundId]) {
    const sound = sounds[currentNode.soundId];
    if (!sound) {
      throw `聲音不存在: ${currentNode.name}`;
    }
    if (currentNode.soundCenterId && !locations[currentNode.soundCenterId]) {
      throw `聲音中心點不存在: ${currentNode.name}\n`;
    }
    const soundAction = {
      id: currentNode.id + "-sound",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "SOUND",
          url: sound ? sound.sound.src : null,
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
    const ps = currentNode.pictures;
    if (ps) {
      ps.forEach((p) => {
        if (!images[p.pictureId] || !images[p.pictureId].image.src) {
          throw `圖片不存在：${currentNode.name}`;
        }
      });
    }
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
          pictures: ps ? ps.map((p) => images[p.pictureId].image.src) : [],
          allowTextReply: currentNode.allowTextReply ? true : false,
          closeAlertAfterReply: !currentNode.dontCloseAlertAfterReply,
          clearDialog: currentNode.clearDialog,
        },
        condition: condition,
      },
      delay: currentNode.popupDelay,
      description: currentNode.name,
    };
    ret.push(popupAction);
  }
  if (currentNode.hasIncomingCall) {
    const portrait = images[currentNode.portrait];
    if (!portrait) throw `頭像不存在: ${currentNode.name}`;
    const incomingCallAction = {
      id: currentNode.id + "-incoming-call",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "INCOMING_CALL",
          caller: currentNode.caller,
          portrait: currentNode.portrait ? portrait.image.src : null,
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
    const portrait = images[currentNode.portrait];
    if (!portrait) throw `頭像不存在: ${currentNode.name}`;
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
    const icon = images[currentNode.markerIcon];
    if (!icon) throw `圖釘不存在: ${currentNode.name}`;
    const location = locations[currentNode.locationId];
    if (!location) throw `地點不存在: ${currentNode.name}`;
    const markerAction = {
      id: currentNode.id + "-marker",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "MARKER",
          icon: currentNode.markerIcon
            ? icon.image.src
            : // ? `${cdnRoot}/${props.record.id}/images/${currentNode.markerIcon}/image`
              null,
          location: currentNode.locationId ? location : null,
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
  if (currentNode.hasMapStyle && mapStyles[currentNode.mapStyle]) {
    const mapStyle = mapStyles[currentNode.mapStyle];
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
            ? mapStyle.mapStyle.src
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
    const introBackground = images[currentNode.introBackground];
    if (!introBackground) throw `背景不存在: ${currentNode.name}`;
    const introLogo = images[currentNode.introLogo];
    if (!introLogo) throw `Logo不存在: ${currentNode.name}`;
    const mapLogo = images[currentNode.mapLogo];
    if (!mapLogo) throw `地圖Logo不存在: ${currentNode.name}`;
    const introImageAction = {
      id: currentNode.id + "-intro-image",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "INTRO_IMAGE",
          backgroundUrl: currentNode.introBackground
            ? introBackground.image.src
            : null,
          logoUrl: currentNode.introLogo ? introLogo.image.src : null,
          textColor: currentNode.introTextColor || null,
          mapLogoUrl: currentNode.mapLogo ? mapLogo.image.src : null,
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
  if (currentNode.endgame) {
    const endgameAction = {
      id: currentNode.id + "-endgame",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "END_GAME",
        },
        condition: condition,
      },
      delay: currentNode.endgameDelay,
      description: currentNode.name,
    };
    ret.push(endgameAction);
  }
  if (currentNode.hasGuideImage) {
    const guideImage = images[currentNode.guideImage];
    if (!guideImage) throw `指引圖片不存在: ${currentNode.name}`;
    const guideImageAction = {
      id: currentNode.id + "-guide-image",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "GUIDE_IMAGE",
          image: currentNode.guideImage ? guideImage.image.src : null,
        },
        condition: condition,
      },
      delay: currentNode.guideImageDelay,
      description: currentNode.name,
    };
    ret.push(guideImageAction);
  }
  if (currentNode.hasGuideImageRemoval) {
    const guideImageRemovalAction = {
      id: currentNode.id + "-guide-image-removal",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "GUIDE_IMAGE_REMOVAL",
          id: currentNode.guideImageId,
        },
        condition: condition,
      },
      delay: currentNode.guideImageRemovalDelay,
      description: currentNode.name,
    };
    ret.push(guideImageRemovalAction);
  }
  if (currentNode.hasSilence) {
    const silenceAction = {
      id: currentNode.id + "-silence",
      receiver: "?u",
      sender: "ghost",
      content: {
        task: {
          type: "SILENCE",
          id: currentNode.silencedSound + "-sound",
          fadeOutSeconds: currentNode.forceFadeOutSeconds,
        },
        condition: condition,
      },
      delay: currentNode.silenceDelay,
      description: currentNode.name,
    };
    ret.push(silenceAction);
  }
  return ret.map((a) => ({
    ...a,
    session: {
      scenario: "",
      chapter: "",
    },
  }));
};
