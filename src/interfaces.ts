import * as sdk from "aws-sdk";

export interface S3event {
  Records?: sdk.S3.RecordsEvent | undefined;
  Stats?: sdk.S3.StatsEvent | undefined;
  Progress?: sdk.S3.ProgressEvent | undefined;
  Cont?: sdk.S3.ContinuationEvent | undefined;
  End?: sdk.S3.EndEvent | undefined;
};