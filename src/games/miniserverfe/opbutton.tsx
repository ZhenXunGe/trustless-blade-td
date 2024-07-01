import { encode_modifier, createCommand } from "./helper";
import { send_transaction } from "./rpc";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectL2Account } from "../../data/accountSlice";
import {selectExternal, setErrorMessage, setSelectedCreatureIndex, setUserActivity, setViewerActivity} from "./thunk";
import { ObjectProperty } from './types';
import React from "react";

const CMD_INSTALL_PLAYER = 1n;
const CMD_INSTALL_OBJECT = 2n;
const CMD_RESTART_OBJECT = 3n;

function modifiersAreFullfilled(modifier: Array<number|null>) {
  for (let i=0; i<8; i++) {
    if (modifier[i] == null) {
      return false;
    }
  }
  return true;
}



export function ConfirmButton({modifiers}: {modifiers: Array<number|null>}) {
  const external = useAppSelector(selectExternal);
  const dispatch = useAppDispatch();
  const l2account = useAppSelector(selectL2Account);
  const selectedId = external.selectedCreatureIndex;
  const activity = external.userActivity;

  function confirmActivity(modifiers: Array<number>) {
    const mslice = modifiers.slice();
    try {
      //setExternalState("monitoringResult");
      const index = mslice.reverse().map((id) => {
        return BigInt(id);
      });
      const modifiers: bigint = encode_modifier(index);
      if(activity == "creating") {
        const objIndex = BigInt(selectedId!);
        const insObjectCmd = createCommand(CMD_INSTALL_OBJECT, objIndex);
        send_transaction([insObjectCmd, modifiers, 0n, 0n], l2account!.address);
      } else if(activity == "rebooting") {
        const objIndex = BigInt(selectedId!);
        const restartObjectCmd = createCommand(CMD_RESTART_OBJECT, BigInt(objIndex));
        send_transaction([restartObjectCmd, modifiers, 0n, 0n], l2account!.address);
      }
      dispatch(setViewerActivity("monitoringResult"));
    } catch(e) {
      dispatch(setErrorMessage(`confirm ${activity} error`));
    }
  }

  function handleReboot() {
      dispatch(setUserActivity("rebooting"))
  }

  if (external.userActivity == "browsing") {
    if(external.getSelectedIndex() != null){
      return <button className="reboot" onClick={handleReboot}>Reboot</button>;
    } else {
      return <></>
    }
  } else {
    if (modifiersAreFullfilled(modifiers)) {
        return <button className="confirm" onClick={() => {
            confirmActivity(modifiers.map((x)=>x!));
        }}>Confirm</button>;
    } else {
        return <span>Not all modifiers fullfilled</span>;
    }
  }
}


export function CreateButton({objects}: {objects: Array<ObjectProperty>}) {
  const dispatch = useAppDispatch();
  function handleCreateObject(len: number) {
    dispatch(setSelectedCreatureIndex(len));
    dispatch(setUserActivity("creating"));
  }

  const external = useAppSelector(selectExternal);
  if (external.viewerActivity == "monitoringResult") {
    return <></>;
  } else if (external.userActivity != "creating"
      && external.viewerActivity != "idle") {
    return <button className="createButton" onClick={() => { handleCreateObject(objects.length); }}>NEW +</button>;
  } else {
    return <div></div>;
  }
}
