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
import Filter from '@c3/ui/UiSdlFilter';
import DateTime from '@c3/ui/UiSdlDateTime';

export function epic(actionStream: UiSdlActionsObservable, stateStream: UiSdlStatesObservable): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      // Get filter button value
      let workstreamType = action?.payload?.value?.[0];
      let filter = workstreamType == 'PAST' ? new Filter().lt('end', new DateTime()).toString() : new Filter().gt('end', new DateTime()).toString()

      let observables = [
        // Reload Workstreams card list
        of(
          mergeArgumentsAction(
            "PodBalancer.AnalysisWorkstreamsCardList_dataSpec_ds",
            {
              spec: {
                filter: filter
              }
            }
          )
        ),
        of(
          requestDataAction(
            "PodBalancer.AnalysisWorkstreamsCardList_dataSpec_ds"
          )
        ),
      ];

      return from(observables).pipe(concatAll());
    })
  );
}
