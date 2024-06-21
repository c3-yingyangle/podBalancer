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
import { getFormFieldValuesFromState } from "@c3/ui/UiSdlForm";
import { from, of } from "rxjs";
import { concatAll, mergeMap } from "rxjs/operators";

export function epic(
  actionStream: UiSdlActionsObservable,
  stateStream: UiSdlStatesObservable
): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      const state = stateStream.value;

      const workstreamId: string = state.getIn([
        "metadata",
        "applications",
        "byId",
        "PodBalancer.PodBalancerApplicationState",
        "manageWorkstream",
        "id",
      ]);

      // Get form field values
      let formFieldValues = getFormFieldValuesFromState(
        "PodBalancer.AnalysisWorkstreamsManageModalForm",
        state
      );
      let id = formFieldValues?.id || null;
      let name = formFieldValues?.name || null;
      let query = formFieldValues?.query || null;
      let hoursPerStoryPoint = formFieldValues?.hoursPerStoryPoint || null;
      let start = formFieldValues?.start || null;
      let end = formFieldValues?.end || null;

      // Merge Workstream record

      // Create new Workstream record
      // TODO: handle cases where Workstream with this name already exists
      return ajax("Workstream", "merge", {
        this: {
          id: id,
          name: name,
          query: query,
          hoursPerStoryPoint: hoursPerStoryPoint,
          start: start,
          end: end,
        },
      }).pipe(
        mergeMap(function () {
          return ajax("Workstream", "refreshIssues", {
            this: { id: workstreamId },
            limit: 10000,
          }).pipe(
            mergeMap(function () {
              let observables = [
                // Reload Workstreams card list
                of(
                  requestDataAction(
                    "PodBalancer.AnalysisWorkstreamsCardList_dataSpec_ds"
                  )
                ),

                // Renable button
                of(
                  setDisabledAction(
                    "PodBalancer.AnalysisWorkstreamsManageModalRefreshButton",
                    false
                  )
                ),
                of(
                  setLoadingAction(
                    "PodBalancer.AnalysisWorkstreamsManageModalRefreshButton",
                    false
                  )
                ),
              ];

              return from(observables).pipe(concatAll());
            })
          );
        })
      );
    })
  );
}
