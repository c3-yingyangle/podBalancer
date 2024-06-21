/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import * as React from 'react';
import UiSdlPageContainer, { UiSdlPageContainerProps } from '@c3/ui/UiSdlPageContainerReact';
import '@c3/ui/UiSdlBaseCssPageContainer.scss';

const UiSdlBaseCssPageContainer: React.FunctionComponent<UiSdlPageContainerProps> = (props) => {
  return (
    <div className="base-css-page-container">
      <UiSdlPageContainer {...props} />
    </div>
  );
};

export default UiSdlBaseCssPageContainer;
