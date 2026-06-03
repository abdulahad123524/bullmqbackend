const Product = require("../models/product.model");
const { productQueue, queueEvents } = require("../queues/product.queue");
const {
  maxBulkProducts,
  getBulkJobWaitMs,
  jobWaitMsBase,
} = require("../config/limits");

const waitForJob = async (job, waitMs = jobWaitMsBase) => {
  return job.waitUntilFinished(queueEvents, waitMs);
};

const handleQueueError = (res, error, jobId) => {
  if (error.message?.includes("timed out") && jobId) {
    return res.status(202).json({
      message: "Request queued — high load. Job will complete shortly.",
      jobId,
      status: "processing",
    });
  }

  if (error.message === "Product not found") {
    return res.status(404).json({ message: error.message });
  }

  return res.status(500).json({ message: error.message });
};

const createProduct = async (req, res) => {
  let job;
  try {
    const { name, price, description } = req.body;
    job = await productQueue.add("create", { name, price, description });
    const product = await waitForJob(job);
    res.status(201).json(product);
  } catch (error) {
    handleQueueError(res, error, job?.id);
  }
};

const updateProduct = async (req, res) => {
  let job;
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    job = await productQueue.add("update", { id, name, price, description });
    const product = await waitForJob(job);
    res.status(200).json(product);
  } catch (error) {
    handleQueueError(res, error, job?.id);
  }
};

const deleteProduct = async (req, res) => {
  let job;
  try {
    const { id } = req.params;
    job = await productQueue.add("delete", { id });
    const product = await waitForJob(job);
    res.status(200).json(product);
  } catch (error) {
    handleQueueError(res, error, job?.id);
  }
};

const getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkCreateProducts = async (req, res) => {
  let job;
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "products array is required" });
    }

    if (products.length > maxBulkProducts) {
      return res.status(400).json({
        message: `Too many products (${products.length}). Maximum ${maxBulkProducts} per upload. Split your file and try again.`,
        maxProducts: maxBulkProducts,
        received: products.length,
      });
    }

    const waitMs = getBulkJobWaitMs(products.length);
    job = await productQueue.add("bulkCreate", { products });
    const result = await waitForJob(job, waitMs);
    res.status(201).json(result);
  } catch (error) {
    handleQueueError(res, error, job?.id);
  }
};

const bulkDeleteProducts = async (_req, res) => {
  let job;
  try {
    job = await productQueue.add("bulkDelete", {});
    const result = await waitForJob(job);
    res.status(200).json({
      message: `${result.deletedCount} product${result.deletedCount === 1 ? "" : "s"} deleted.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    handleQueueError(res, error, job?.id);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  bulkCreateProducts,
  bulkDeleteProducts,
};
