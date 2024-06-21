/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { mergeMap, concatAll } from 'rxjs/operators';
import { of, from, EMPTY } from 'rxjs';
import { UiSdlActionsObservable, UiSdlStatesObservable } from '@c3/types';
import { ajax, requestDataAction, mergeArgumentsAction } from "@c3/ui/UiSdlDataRedux";
import { getConfigFromState } from "@c3/ui/UiSdlFormDataGrid";
import { getFormFieldValuesFromState } from "@c3/ui/UiSdlForm";
import { getDataFromState } from "@c3/ui/UiSdlConnected"

export function epic(actionStream: UiSdlActionsObservable, stateStream: UiSdlStatesObservable): UiSdlActionsObservable {
  return actionStream.pipe(
    mergeMap(function (action) {
      const state = stateStream.value;

      // Get form field values
      let formFieldValues = getFormFieldValuesFromState('PodBalancer.AnalysisPersonModalForm', state);
      let name = formFieldValues?.name || null;
      let email = formFieldValues?.email || null;
      let companyHolidayCalendar = formFieldValues?.companyHolidayCalendar || null;


      return ajax('Person', 'createPerson', {
        spec: {
          id: name,
          name: name,
          email: email,
          // company: companyHolidayCalendar,
        }
      }).pipe(
          mergeMap(function (ajaxEvent) {
            let observables = [
              // Reload Workstreams card list
              of(
                requestDataAction(
                  "PodBalancer.AnalysisPersonDataGrid_dataSpec_ds"
                )
              )
            ];
  
            return from(observables).pipe(concatAll());
        }))
    })
  );
}
