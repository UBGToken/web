import { createStore, applyMiddleware, combineReducers } from 'redux'
import { HYDRATE, createWrapper, MakeStore } from 'next-redux-wrapper'
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension'

import { isDev } from './AppConfigs'
import { appReducer } from './services/app/app.reducer'

export const rootReducer = combineReducers({
  app: appReducer,
})

const reducer = (state: any, action: any) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    }
    return nextState
  } else {
    return rootReducer(state, action);
  }
}

export const makeStore: MakeStore = () => createStore(
  reducer,
  isDev && composeWithDevTools(applyMiddleware())
);

export const wrapper = createWrapper(makeStore)

export type RootState = ReturnType<typeof rootReducer>
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

export type TStoreAction = {
  type: string,
  [name: string]: any
}
