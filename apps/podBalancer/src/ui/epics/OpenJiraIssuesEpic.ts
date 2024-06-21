/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { UiSdlActionsObservable, UiSdlStatesObservable } from "@c3/types";
import { ajax } from "@c3/ui/UiSdlDataRedux";
import { EMPTY } from "rxjs";
import { mergeMap } from "rxjs/operators";

export function epic(
  actionStream: UiSdlActionsObservable,
  stateStream: UiSdlStatesObservable
): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      const state = stateStream.value;

      const query: string = state.getIn([
        "metadata",
        "applications",
        "byId",
        "PodBalancer.PodBalancerApplicationState",
        "selectedWorkstream",
        "query",
      ]);

      if (!query) return EMPTY;

      return ajax("JiraIntegration.Config", "getConfig", {}).pipe(
        mergeMap(function (ajaxEvent) {
          var config = ajaxEvent.response;

          var urlBase = config.jiraUrl;
          var queryString: string = encodeURIComponent(query);
          var url = urlBase + "issues/?" + "jql=" + queryString;
          open(url, "_blank");

          return EMPTY;
        })
      );
    })
  );
}
