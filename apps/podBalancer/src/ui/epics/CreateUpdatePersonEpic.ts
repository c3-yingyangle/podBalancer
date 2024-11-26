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
import { storeCurrentWorkstreamAction } from '@c3/ui/PodBalancerApplicationState';
import { requestDataAction, mergeArgumentsAction } from "@c3/ui/UiSdlDataRedux";
import { getConfigFromState } from "@c3/ui/UiSdlConnected";

export function epic(actionStream: UiSdlActionsObservable, stateStream: UiSdlStatesObservable): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      let state = stateStream?.value;

      // Get selected Workstream from action payload
      let selectedWorkstream = action?.payload?.cardData;

      // Get the current interval selected
      let interval = getConfigFromState('PodBalancer.AnalysisBurndownChartIntervalButton', state, ['value'])?.toJS()?.[0];

      let observables = [
        // Store the selected Workstream in app state
        of(storeCurrentWorkstreamAction('PodBalancer.PodBalancerApplicationState', selectedWorkstream)),

        // Reload burndown chart
        of(
          mergeArgumentsAction(
            "PodBalancer.AnalysisBurndownChart_dataSpec_ds",
            {
              workstreamId: selectedWorkstream.id,
              interval: interval
            }
          )
        ),
        of(
          requestDataAction(
            "PodBalancer.AnalysisBurndownChart_dataSpec_ds"
          )
        ),
      ];

      return from(observables).pipe(concatAll());
    })
  );
}
