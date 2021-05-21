import express from "express";

import * as s3 from "./s3";

export const createApp = (): express.Express => {
  const app = express();
  app.use(express.json());
  app.get("/local_government/:local_government_code", s3.getLocalGovernment);
  app.get("/prefecture/:prefecture_code", s3.getPrefecture);
  app.get("/", s3.getMessage);
  return app;
};
