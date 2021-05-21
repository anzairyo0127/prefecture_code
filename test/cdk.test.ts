import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Cdk from '../cdk/stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    const props = {resourcesDir: ""};
    const stack = new Cdk.PrefectureCodeProjectStack(app, 'MyTestStack', props);
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
