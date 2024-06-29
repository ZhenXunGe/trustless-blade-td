import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { query_config } from './rpc';
import { RootState } from "../../app/store";
import { ExternalState, Modifier } from './types';

export const getConfig= createAsyncThunk(
  'client/getConfig',
  async (thunkApi) => {
    const res = await query_config();
    const data = JSON.parse(res.data);
    return data;
  }
)

interface ClientState {
  localAttributes: string[];
  entityAttributes: string[];
  modifiers: Modifier[];
  external: ExternalState;
  globalTimer: number,
}

const initialState: ClientState = {
  external: new ExternalState(),
  localAttributes: [],
  entityAttributes: [],
  modifiers: [],
  globalTimer: 0,
}

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setUserActivity: (state, loaded) => {
      state.external.userActivity = loaded.payload;
    },
    setGlobalTimer: (state, loaded) => {
      state.globalTimer = loaded.payload;
    },
    setSelectedCreatureIndex: (state, loaded) => {
      state.external.selectedCreatureIndex = loaded.payload;
    },

    setViewerActivity: (state, loaded) => {
      state.external.viewerActivity = loaded.payload;
    },
    setErrorMessage: (state, loaded) => {
      state.external.errorMessage = loaded.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConfig.pending, (state) => {
        //
        state.external.viewerActivity = "queryConfig";
        console.log("query config pending");
      })
      .addCase(getConfig.fulfilled, (state, c) => {
        state.external.viewerActivity = "idle";
        state.entityAttributes = c.payload.entity_attributes;
        state.localAttributes = c.payload.local_attributes;
        //state.modifiers = c.payload.modifiers;
        // set state.modifiers
        let delay: number;
        let entity: Array<number>;
        let local: Array<number>;
        let name: string;
        const modifierArray: Modifier[] = [];
        const modifiers = c.payload.modifiers;
        for(let i=0; i<modifiers.length; i++) {
          delay = modifiers[i][0];
          entity = modifiers[i][1];
          local = modifiers[i][2];
          name = modifiers[i][3];
          console.log("1234", delay,entity,local,name)
          modifierArray.push({"delay": delay, "entity": entity, "local": local, "name": name});
        }
        state.modifiers = modifierArray;
        console.log("query config fulfilled");
      })
  },
});

export const selectExternal = (state: RootState) => state.client.external;
export const selectGlobalTimer = (state: RootState) => state.client.globalTimer;
export const selectLocalAttributes = (state: RootState) => state.client.localAttributes;
export const selectEntityAttributes = (state: RootState) => state.client.entityAttributes;
export const selectModifier = (state: RootState) => state.client.modifiers;
export const { setGlobalTimer, setViewerActivity, setErrorMessage, setSelectedCreatureIndex, setUserActivity} = clientSlice.actions;
export default clientSlice.reducer;