let CONFIG = {
  hashMode: false,
};

export function getConfig() {
  return CONFIG;
}

export function setConfig(config: Config) {
  CONFIG = config;
}

export type Config = {
  hashMode: boolean;
};
