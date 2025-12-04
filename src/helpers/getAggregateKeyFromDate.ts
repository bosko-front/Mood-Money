export const getAggregateKeyFromDate = (date: Date) => {
    const now = new Date();
    const year = date.getFullYear();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
        const oneJan = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
        return `${year}-W${week}`;
    }

    if (diffDays <= 30) {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${year}-${month}`;
    }

    if (diffDays <= 90) {
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        return `${year}-Q${quarter}`;
    }

    // half-year
    const half = date.getMonth() < 6 ? "H1" : "H2";
    return `${year}-${half}`;
};
