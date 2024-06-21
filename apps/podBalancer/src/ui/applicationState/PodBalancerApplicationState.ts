/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { setConfigInApplicationState } from '@c3/ui/UiSdlApplicationState';

export function storeCurrentWorkstreamAction(id, obj) {
  return {
    type: id + '.STORE_WORKSTREAM',
    payload: {
      applicationStateId: id,
      obj: obj,
    },
  };
}

export function storeCurrenWorkstreamReducer(state, action) {
  // Save current Workstream in Application State
  return setConfigInApplicationState(action.payload.applicationStateId, state, ['selectedWorkstream'], action.payload.obj);
}
