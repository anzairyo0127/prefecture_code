import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Runtime } from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";

export interface GetFunctionProps {
  stack: cdk.Construct,
  handler: string,
  entry: string,
  bucketProps: S3BucketFunctionProps,
  functionName: string,
};

export interface S3BucketFunctionProps {
  bucketName: string,
  bucketTargetName: string,
};

export const createGetFunction = (props: GetFunctionProps) => {
  const lambda = new NodejsFunction(props.stack, props.functionName, {
    functionName: props.functionName,
    entry: props.entry,
    handler: props.handler,
    memorySize: 256,
    runtime: Runtime.NODEJS_14_X,
    environment: {
      TZ: "Asia/Tokyo",
      BUCKET_NAME: props.bucketProps.bucketName,
      BUCKET_TARGET_NAME: "000730858.gzip",
    },
    bundling: { minify: true }
  });
  lambda.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"));
  return lambda;
};
