const logInfo = (message) => {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`${time} [info]: ${message}`);
};

const logError = (message) => {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.error(`${time} [error]: ${message}`);
};

const stream = {
  write: (message) => {
    logInfo(message.trim());
  },
};

module.exports = { logInfo, logError, stream };
