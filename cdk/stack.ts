import * as cdk from '@aws-cdk/core';
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as apig from "@aws-cdk/aws-apigateway";
import * as kms from "@aws-cdk/aws-kms";

import * as lambdas from "./lamdas";

const responseOption: apig.MethodOptions = {
  // メソッドレスポンスの設定（CORS）
  methodResponses: [
    {
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Origin': true
      }
    }
  ],
};

const IntegrationOption: apig.LambdaIntegrationOptions = {
  connectionType: apig.ConnectionType.INTERNET,
  // 統合リクエストの設定
  requestTemplates: {
    'application/json': "$input.body"
  },
  // 統合レスポンスの設定（CORS)
  integrationResponses: [
    {
      statusCode: '200',
      contentHandling: apig.ContentHandling.CONVERT_TO_TEXT,
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Origin,Content-Type,Authorization'",
        'method.response.header.Access-Control-Allow-Methods': "'GET'",
        // 'method.response.header.Access-Control-Allow-Origin': "'*'"
      },
      responseTemplates: {
        'application/json': "$input.body"
      },
    },
  ],
  passthroughBehavior: apig.PassthroughBehavior.WHEN_NO_MATCH,
  proxy: true,
};

interface PrefectureCodeProjectStackProps extends cdk.StackProps {
  resourcesDir: string,
};

export class PrefectureCodeProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PrefectureCodeProjectStackProps) {
    super(scope, id, props);
    // readme https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-readme.html
    const prefecureCodeBucket = new s3.Bucket(this, "prefecture_code_bucket", {
      publicReadAccess: true,
    });
    new s3deploy.BucketDeployment(this, 'prefecture_bucket', {
      sources: [s3deploy.Source.asset(props.resourcesDir)],
      destinationBucket: prefecureCodeBucket,
    });
    // readme https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html
    const prefecureCodeApi = new apig.RestApi(this, "PrefecureCodeApi", {
      restApiName: "PrefecureCodeApi",
      deployOptions: {
        stageName: "v1",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apig.Cors.ALL_ORIGINS,
        allowMethods: ["GET"],
        statusCode: 200,
      },
    });
    const getLocalGovermentProps: lambdas.GetFunctionProps = {
      stack: this,
      entry: "./src/handlers.ts",
      handler: "getLocalGovernment",
      functionName: "getLocalGoverment",
      bucketProps: {
        bucketName: prefecureCodeBucket.bucketName,
        bucketTargetName: "",
      },
    };
    const getLocalGovernment = lambdas.createGetFunction(getLocalGovermentProps);
    const getLocalGovernmentIntegration = new apig.LambdaIntegration(getLocalGovernment, IntegrationOption);

    prefecureCodeBucket.grantRead(getLocalGovernment);
    const lg = prefecureCodeApi.root.addResource("local_government");
    const localGovermentResource = lg.addResource("{local_government_code}");
    localGovermentResource.addMethod("GET", getLocalGovernmentIntegration, responseOption);

    const getPrefectureProps: lambdas.GetFunctionProps = {
      stack: this,
      entry: "./src/handlers.ts",
      handler: "getPrefecture",
      functionName: "getPrefecture",
      bucketProps: {
        bucketName: prefecureCodeBucket.bucketName,
        bucketTargetName: "",
      },
    };
    const getPrefectureCode = lambdas.createGetFunction(getPrefectureProps);
    const getPrefectureIntegration = new apig.LambdaIntegration(getPrefectureCode, IntegrationOption);

    prefecureCodeBucket.grantRead(getPrefectureCode);
    const pc = prefecureCodeApi.root.addResource("prefecture");
    const prefectureResource = pc.addResource("{prefecture_code}");
    prefectureResource.addMethod("GET", getPrefectureIntegration, responseOption);

  }
}