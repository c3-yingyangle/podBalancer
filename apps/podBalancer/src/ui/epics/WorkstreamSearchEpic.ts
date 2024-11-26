import {
  UiSdlActionsObservable,
  UiSdlReduxAction,
  UiSdlStatesObservable,
} from "@c3/types";
import { ImmutableReduxState } from "@c3/ui/UiSdlConnected";
import { mergeArgumentsAction, requestDataAction } from "@c3/ui/UiSdlDataRedux";
import { Epic } from "redux-observable";
import { concat, of } from "rxjs";
import { mergeMap } from "rxjs/operators";

export const epic: Epic<
  UiSdlReduxAction,
  UiSdlReduxAction,
  ImmutableReduxState
> = (
  actionStream: UiSdlActionsObservable,
  stateStream: UiSdlStatesObservable
): UiSdlActionsObservable => {
  return actionStream.pipe(
    mergeMap(function (action: UiSdlReduxAction) {
      const state = stateStream.value;

      const value: string | undefined = action?.payload?.value ?? undefined;
      const searchField: string | undefined =
        action?.payload?.searchField ?? undefined;
      const componentDataSpecId: string | undefined =
        action?.payload?.componentDataSpecId ?? undefined;

      return concat(
        of(
          mergeArgumentsAction(componentDataSpecId, {
            spec: { filter: `contains(${searchField}, "${value}")` },
          })
        ),
        of(requestDataAction(componentDataSpecId))
      );
    })
  );
};
