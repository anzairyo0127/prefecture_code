#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PrefectureCodeProjectStack } from "./stack";

const app = new cdk.App();

new PrefectureCodeProjectStack(app, 'CdkStack', {
    resourcesDir: "./resources"
});
