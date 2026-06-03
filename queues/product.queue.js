const { Queue, QueueEvents } = require("bullmq");
const { connection } = require("../config/bullmq");

const PRODUCT_QUEUE_NAME = "product";

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
  },
  removeOnComplete: false,
  removeOnFail: false,
};

const productQueue = new Queue(PRODUCT_QUEUE_NAME, {
  connection,
  defaultJobOptions,
});

const queueEvents = new QueueEvents(PRODUCT_QUEUE_NAME, { connection });

module.exports = {
  productQueue,
  queueEvents,
  PRODUCT_QUEUE_NAME,
};
