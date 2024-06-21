/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { mergeMap, concatAll } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { UiSdlActionsObservable, UiSdlStatesObservable } from '@c3/types';
import { ajax, requestDataAction, mergeArgumentsAction } from "@c3/ui/UiSdlDataRedux";
import { getFormFieldValuesFromState } from "@c3/ui/UiSdlForm";

export function epic(actionStream: UiSdlActionsObservable, stateStream: UiSdlStatesObservable): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      const state = stateStream.value;

      // Get form field values
      let formFieldValues = getFormFieldValuesFromState('PodBalancer.AnalysisWorkstreamsModalForm', state);
      let name = formFieldValues?.name || null;
      let query = formFieldValues?.query || null;
      let hoursPerStoryPoint = formFieldValues?.hoursPerStoryPoint || null;
      let start = formFieldValues?.dateRange?.[0] || null;
      let end = formFieldValues?.dateRange?.[1] || null;

      // Create new Workstream record
      // TODO: handle cases where Workstream with this name already exists
      return ajax('Workstream', 'createWorkstream', {
        spec: {
          id: name,
          name: name,
          query: query,
          hoursPerStoryPoint: hoursPerStoryPoint,
          start: start,
          end: end
        }
      }).pipe(
        mergeMap(function (ajaxEvent) {
          let observables = [
            // Reload Workstreams card list
            of(
              requestDataAction(
                "PodBalancer.AnalysisWorkstreamsCardList_dataSpec_ds"
              )
            )
          ];

          return from(observables).pipe(concatAll());
      }))
    })
  );
}
