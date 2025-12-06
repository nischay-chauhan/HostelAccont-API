import { Incharge, PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/Apiresponse";

const prisma = new PrismaClient();

const getInchargeHostelNumber = (req: any): string => {
    const incharge = req.user as Incharge;
    if (!incharge || !incharge.hostelNumber) {
        throw new ApiError(403, "Access denied: Incharge hostel information not found");
    }
    return incharge.hostelNumber;
};

const getOverview = asyncHandler(async (req, res) => {
    const hostelNumber = getInchargeHostelNumber(req);

    const whereClause = { hostelNumber };

    const totalStudents = await prisma.student.count({
        where: whereClause,
    });

    const revenueResult = await prisma.orderBill.aggregate({
        _sum: { itemPrice: true },
        where: { buyer: { hostelNumber } },
    });
    const totalRevenue = revenueResult._sum.itemPrice || 0;

    const totalOrders = await prisma.orderBill.count({
        where: { buyer: { hostelNumber } },
    });

    const pendingPaymentsResult = await prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
            status: "pending",
            student: { hostelNumber },
        },
    });
    const pendingAmount = pendingPaymentsResult._sum.amount || 0;
    const pendingCount = pendingPaymentsResult._count || 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthRevenue = await prisma.orderBill.aggregate({
        _sum: { itemPrice: true },
        where: {
            createdAt: { gte: startOfMonth },
            buyer: { hostelNumber },
        },
    });

    const hostels = await prisma.student.groupBy({
        by: ["hostelNumber", "hostelName"],
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalStudents,
                totalRevenue,
                totalOrders,
                pendingAmount,
                pendingCount,
                thisMonthRevenue: thisMonthRevenue._sum.itemPrice || 0,
                hostels,
            },
            "Overview retrieved successfully"
        )
    );
});

const getRevenue = asyncHandler(async (req, res) => {
    const months = parseInt(req.query.months as string) || 6;
    // Get hostelNumber from the authenticated incharge's token
    const hostelNumber = getInchargeHostelNumber(req);

    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    const orders = await prisma.orderBill.findMany({
        where: {
            createdAt: { gte: monthsAgo },
            buyer: { hostelNumber },
        },
        select: {
            itemPrice: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const monthlyRevenue: { [key: string]: number } = {};
    const monthlyOrders: { [key: string]: number } = {};

    orders.forEach((order) => {
        const monthKey = `${order.createdAt.getFullYear()}-${String(
            order.createdAt.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.itemPrice;
        monthlyOrders[monthKey] = (monthlyOrders[monthKey] || 0) + 1;
    });

    const result = [];
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
        )}`;
        const monthName = date.toLocaleString("default", { month: "short" });
        result.push({
            month: monthKey,
            monthName,
            revenue: monthlyRevenue[monthKey] || 0,
            orders: monthlyOrders[monthKey] || 0,
        });
    }

    return res.status(200).json(
        new ApiResponse(200, { monthlyRevenue: result }, "Revenue data retrieved successfully")
    );
});

const getTopItems = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const hostelNumber = getInchargeHostelNumber(req);

    const items = await prisma.orderBill.groupBy({
        by: ["itemName"],
        _sum: { itemPrice: true },
        _count: { itemName: true },
        where: { buyer: { hostelNumber } },
        orderBy: { _count: { itemName: "desc" } },
        take: limit,
    });

    const topItems = items.map((item) => ({
        name: item.itemName,
        quantity: item._count.itemName,
        revenue: item._sum.itemPrice || 0,
    }));

    return res.status(200).json(
        new ApiResponse(200, { topItems }, "Top items retrieved successfully")
    );
});

const getSpendingPatterns = asyncHandler(async (req, res) => {
    const hostelNumber = getInchargeHostelNumber(req);

    const orders = await prisma.orderBill.findMany({
        where: { buyer: { hostelNumber } },
        select: {
            itemPrice: true,
            createdAt: true,
            itemName: true,
        },
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const spendingByDay = dayNames.map((day) => ({ day, amount: 0, count: 0 }));

    const timeSlots = [
        { name: "Morning (6-12)", amount: 0, count: 0 },
        { name: "Afternoon (12-17)", amount: 0, count: 0 },
        { name: "Evening (17-21)", amount: 0, count: 0 },
        { name: "Night (21-6)", amount: 0, count: 0 },
    ];

    orders.forEach((order) => {
        const dayIndex = order.createdAt.getDay();
        spendingByDay[dayIndex].amount += order.itemPrice;
        spendingByDay[dayIndex].count += 1;

        const hour = order.createdAt.getHours();
        if (hour >= 6 && hour < 12) {
            timeSlots[0].amount += order.itemPrice;
            timeSlots[0].count += 1;
        } else if (hour >= 12 && hour < 17) {
            timeSlots[1].amount += order.itemPrice;
            timeSlots[1].count += 1;
        } else if (hour >= 17 && hour < 21) {
            timeSlots[2].amount += order.itemPrice;
            timeSlots[2].count += 1;
        } else {
            timeSlots[3].amount += order.itemPrice;
            timeSlots[3].count += 1;
        }
    });

    const topSpenders = await prisma.student.findMany({
        where: { hostelNumber },
        select: {
            id: true,
            name: true,
            hostelRollNo: true,
            roomNumber: true,
            orders: {
                select: { itemPrice: true },
            },
        },
        take: 10,
    });

    const spendersList = topSpenders
        .map((student) => ({
            id: student.id,
            name: student.name,
            hostelRollNo: student.hostelRollNo,
            roomNumber: student.roomNumber,
            totalSpent: student.orders.reduce((sum, order) => sum + order.itemPrice, 0),
            orderCount: student.orders.length,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                spendingByDay,
                timeSlots,
                topSpenders: spendersList,
            },
            "Spending patterns retrieved successfully"
        )
    );
});

const getDefaulters = asyncHandler(async (req, res) => {
    const hostelNumber = getInchargeHostelNumber(req);

    const defaulters = await prisma.payment.findMany({
        where: {
            status: { in: ["pending", "partial"] },
            student: { hostelNumber },
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    hostelRollNo: true,
                    roomNumber: true,
                    hostelName: true,
                    hostelNumber: true,
                    department: true,
                },
            },
        },
        orderBy: { dueDate: "asc" },
    });

    const today = new Date();
    const defaultersList = defaulters.map((payment) => {
        const dueDate = new Date(payment.dueDate);
        const daysOverdue = Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
            paymentId: payment.id,
            student: payment.student,
            amount: payment.amount,
            status: payment.status,
            dueDate: payment.dueDate,
            daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
            isOverdue: daysOverdue > 0,
        };
    });

    return res.status(200).json(
        new ApiResponse(200, { defaulters: defaultersList }, "Defaulters list retrieved successfully")
    );
});

const getHostels = asyncHandler(async (req, res) => {
    const hostels = await prisma.student.groupBy({
        by: ["hostelNumber", "hostelName"],
        _count: { id: true },
    });

    const hostelList = hostels.map((h) => ({
        hostelNumber: h.hostelNumber,
        hostelName: h.hostelName,
        studentCount: h._count.id,
    }));

    return res.status(200).json(
        new ApiResponse(200, { hostels: hostelList }, "Hostels list retrieved successfully")
    );
});

const getRecentTransactions = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const hostelNumber = getInchargeHostelNumber(req);

    const transactions = await prisma.orderBill.findMany({
        where: { buyer: { hostelNumber } },
        include: {
            buyer: {
                select: {
                    name: true,
                    hostelRollNo: true,
                    roomNumber: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return res.status(200).json(
        new ApiResponse(200, { transactions }, "Recent transactions retrieved successfully")
    );
});

export {
    getOverview,
    getRevenue,
    getTopItems,
    getSpendingPatterns,
    getDefaulters,
    getHostels,
    getRecentTransactions,
};
