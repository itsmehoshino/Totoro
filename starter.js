require("tsconfig-paths").register();

require("ts-node").register({
  project: "tsconfig.json",
});

require("./source/main");