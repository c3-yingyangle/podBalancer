/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { UiSdlActionsObservable, UiSdlStatesObservable } from "@c3/types";
import { setDisabledAction, setLoadingAction } from "@c3/ui/UiSdlButton";
import { ajax, requestDataAction } from "@c3/ui/UiSdlDataRedux";
import { openCloseModalAction } from "@c3/ui/UiSdlModal";
import { from, of } from "rxjs";
import { concatAll, mergeMap } from "rxjs/operators";

export function epic(
  actionStream: UiSdlActionsObservable,
  stateStream: UiSdlStatesObservable
): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      const state = stateStream.value;

      // Get selected Workstream from action payload
      let selectedWorkstream = state.getIn([
        "metadata",
        "applications",
        "byId",
        "PodBalancer.PodBalancerApplicationState",
        "manageWorkstream",
        "id",
      ]);

      // Create new Workstream record
      return ajax("Workstream", "remove", {
        this: selectedWorkstream,
      }).pipe(
        mergeMap(function (ajaxEvent) {
          let observables = [
            // Reload Workstreams card list
            of(
              requestDataAction(
                "PodBalancer.AnalysisWorkstreamsCardList_dataSpec_ds"
              )
            ),
            of(
              openCloseModalAction(
                "PodBalancer.AnalysisWorkstreamsManageModal",
                false
              )
            ),

            // Renable button
            of(
              setDisabledAction(
                "PodBalancer.AnalysisWorkstreamsManageModalRemoveButton",
                false
              )
            ),
            of(
              setLoadingAction(
                "PodBalancer.AnalysisWorkstreamsManageModalRemoveButton",
                false
              )
            ),
          ];

          return from(observables).pipe(concatAll());
        })
      );
    })
  );
}
