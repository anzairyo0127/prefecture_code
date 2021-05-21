import * as sdk from "aws-sdk";
import e from "express";
import * as I from "./interfaces";

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
  for await (const event of eventStream as I.S3event[]) {
      if (event.Records) {
          s += event.Records?.Payload?.toString();
      }
  };
  return JSON.parse(`[${s.replace(/,$/, "")}]`);
};

export const getPrefecture = async (req: e.Request, res: e.Response) => {
  const prefectureCode = req.params["prefecture_code"];
  const result = await getBucketFromSQL(`SELECT * FROM s3object s WHERE s.prefecture_code = '${prefectureCode}'`);
  res.status(200).json(await surgeryS3Result(result.Payload as sdk.S3.SelectObjectContentEventStream));
  return;
};

export const getLocalGovernment = async (req: e.Request, res: e.Response) => {
  const localGovernmentCode = req.params["local_government_code"];
  const result = await getBucketFromSQL(`SELECT * FROM s3object s WHERE s.local_government_code = '${localGovernmentCode}'`);
  res.status(200).json(await surgeryS3Result(result.Payload as sdk.S3.SelectObjectContentEventStream));
  return;
};

export const getMessage = (req: e.Request, res: e.Response) => {
  res.status(200).json({message: "hello"});
  return;
};
