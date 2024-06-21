/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { UiSdlActionsObservable, UiSdlStatesObservable } from "@c3/types";
import { storeManageWorkstreamAction } from "@c3/ui/PodBalancerApplicationState";
import { openCloseModalAction } from "@c3/ui/UiSdlModal";
import { from, of } from "rxjs";
import { concatAll, mergeMap } from "rxjs/operators";

export function epic(
  actionStream: UiSdlActionsObservable,
  stateStream: UiSdlStatesObservable
): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      let state = stateStream?.value;

      // Get selected Workstream from action payload
      let selectedWorkstream = action?.payload?.cardData;

      let observables = [
        // Store the selected Workstream in app state
        of(
          storeManageWorkstreamAction(
            "PodBalancer.PodBalancerApplicationState",
            selectedWorkstream
          )
        ),

        // Open the modal
        of(openCloseModalAction(action.payload.modalId, true)),
      ];

      return from(observables).pipe(concatAll());
    })
  );
}
