import express from "express";
import {
    getOverview,
    getRevenue,
    getTopItems,
    getSpendingPatterns,
    getDefaulters,
    getHostels,
    getRecentTransactions,
} from "../controllers/analytics.controller";
import { isUserLoggedIn } from "../middleware/auth";
import isAdmin from "../middleware/IsAdmin";

const router = express.Router();

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: hostelNumber
 *         schema:
 *           type: string
 *         description: Filter by hostel number
 */
router.get("/overview", isUserLoggedIn, isAdmin, getOverview);

/**
 * @swagger
 * /analytics/revenue:
 *   get:
 *     summary: Get monthly revenue breakdown
 *     tags: [Analytics]
 */
router.get("/revenue", isUserLoggedIn, isAdmin, getRevenue);

/**
 * @swagger
 * /analytics/top-items:
 *   get:
 *     summary: Get most purchased items
 *     tags: [Analytics]
 */
router.get("/top-items", isUserLoggedIn, isAdmin, getTopItems);

/**
 * @swagger
 * /analytics/spending-patterns:
 *   get:
 *     summary: Get spending patterns analysis
 *     tags: [Analytics]
 */
router.get("/spending-patterns", isUserLoggedIn, isAdmin, getSpendingPatterns);

/**
 * @swagger
 * /analytics/defaulters:
 *   get:
 *     summary: Get defaulters list
 *     tags: [Analytics]
 */
router.get("/defaulters", isUserLoggedIn, isAdmin, getDefaulters);

/**
 * @swagger
 * /analytics/hostels:
 *   get:
 *     summary: Get all hostels for filters
 *     tags: [Analytics]
 */
router.get("/hostels", isUserLoggedIn, isAdmin, getHostels);

/**
 * @swagger
 * /analytics/recent-transactions:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Analytics]
 */
router.get("/recent-transactions", isUserLoggedIn, isAdmin, getRecentTransactions);

export default router;
