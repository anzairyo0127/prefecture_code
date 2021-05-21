import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, Callback } from 'aws-lambda';
import * as sdk from "aws-sdk";

export interface S3event {
  Records?: sdk.S3.RecordsEvent | undefined;
  Stats?: sdk.S3.StatsEvent | undefined;
  Progress?: sdk.S3.ProgressEvent | undefined;
  Cont?: sdk.S3.ContinuationEvent | undefined;
  End?: sdk.S3.EndEvent | undefined;
};

const createResponse = (statusCode:number, body?:any) => {
  return {
    statusCode,
    body,
  };
};

const bucketName = process.env.BUCKET_NAME as string;
const bucketTargetName = process.env.BUCKET_TARGET_NAME as string;
const s3 = new sdk.S3();

const getBucketFromSQL = async (sql:string) => {
  return await s3.selectObjectContent({
    Bucket: bucketName,
    Key: bucketTargetName, // "000730858.gzip"
    ExpressionType: "SQL",
    Expression: sql,
    InputSerialization: { CSV: { FileHeaderInfo: "USE" }, CompressionType: "GZIP" },
    OutputSerialization: { JSON: { RecordDelimiter: "," } },
  }).promise();
};

const surgeryS3Result = async (eventStream: sdk.S3.SelectObjectContentEventStream) => {
  let s :string = "";
  for await (const event of eventStream as S3event[]) {
      if (event.Records) {
          s += event.Records?.Payload?.toString();
      }
  };
  return `[${s.replace(/,$/, "")}]`;
};

exports.getLocalGovernment = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
  const localGovernmentCode = event.pathParameters?.local_government_code;
  const result = await getBucketFromSQL(`SELECT * FROM s3object s WHERE s.local_government_code = '${localGovernmentCode}'`);
  if (result.$response.error) return createResponse(400, result.$response.error);
  const output = await surgeryS3Result(result.Payload as sdk.S3.SelectObjectContentEventStream);
  if (output.length < 3) return createResponse(404, output);
  return createResponse(200, output);
};

exports.getPrefecture = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
  const prefectureCode = event.pathParameters?.prefecture_code;
  const result = await getBucketFromSQL(`SELECT * FROM s3object s WHERE s.prefecture_code = '${prefectureCode}'`);
  if (result.$response.error) return createResponse(400, result.$response.error);
  const output = await surgeryS3Result(result.Payload as sdk.S3.SelectObjectContentEventStream);
  if (output.length < 3) return createResponse(404, output);
  return createResponse(200, output);
};
