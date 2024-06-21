/*
 * Copyright 2009-2024 C3 AI (www.c3.ai). All Rights Reserved.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';
import { configure as enzymeConfigure, mount } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import jasmineEnzyme from 'jasmine-enzyme';
import { UiSdlBaseCssPageContainerReact as Props } from '@c3/types';
import UiSdlBaseCssPageContainer from '@c3/ui/UiSdlBaseCssPageContainerReact';
import SpecHelper from '@c3/ui/UiSdlSpecHelper';

const filename = 'test_UiSdlBaseCssPageContainerReact';

describe(filename, function () {
  beforeAll(function () {
    enzymeConfigure({ adapter: new EnzymeAdapter() });

    // eslint-disable-next-line max-len
    this.mount = (props: Props): ReturnType<typeof mount> => SpecHelper.mountWithIntl(<UiSdlBaseCssPageContainer {...SpecHelper.freezeProps(props)} />);
  });

  beforeEach(function () {
    jasmineEnzyme();
  });

  describe('#render', function () {
    beforeEach(function () {
      this.wrapper = this.mount({});
    });

    afterEach(function () {
      this.wrapper.unmount();
    });

    it('renders the baseCss page container React element', function () {
      expect(this.wrapper).toContainExactlyOneMatchingElement('UiSdlBaseCssPageContainer');
    });

    it('renders the wrapper div', function () {
      expect(this.wrapper).toContainExactlyOneMatchingElement('.base-css-page-container');
    });

    it('renders the SDL page container React element', function () {
      expect(this.wrapper).toContainExactlyOneMatchingElement('UiSdlPageContainer');
    });
  });
});
