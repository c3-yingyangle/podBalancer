/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { UiSdlActionsObservable, UiSdlStatesObservable } from "@c3/types";
import { of } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { getConfigFromApplicationState } from "@c3/ui/UiSdlApplicationState";

export function epic(
  actionStream: UiSdlActionsObservable,
  stateStream: UiSdlStatesObservable
): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      const state = stateStream.value;

      // Get the person we want to select
      var personId = getConfigFromApplicationState(action?.payload?.applicationStateId, state, [action?.payload?.applicationStateField])?.toJS().id || null;

      // Prepopulate form field with the given id
      return of({
        type: action.payload?.formId + '.INPUT_CHANGE',
        payload: {
          componentId: action.payload?.formId,
          field: action.payload?.fieldName,
          value: personId,
          state: {
            value: personId
          }
        },
      })
    })
  );
}