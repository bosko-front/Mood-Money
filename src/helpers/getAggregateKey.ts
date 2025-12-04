export const getAggregateKey = (daysRange: number) => {
    const now = new Date();
    const year = now.getFullYear();

    if (daysRange <= 7) {
        // weekly key: YYYY-W##
        const oneJan = new Date(now.getFullYear(), 0, 1);
        const week = Math.ceil(((now.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
        return `${year}-W${week}`;
    }

    if (daysRange <= 30) {
        // monthly key: YYYY-MM
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        return `${year}-${month}`;
    }

    if (daysRange <= 90) {
        // quarterly key: YYYY-Q#
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        return `${year}-Q${quarter}`;
    }

    // half-year
    const half = now.getMonth() < 6 ? "H1" : "H2";
    return `${year}-${half}`;
};
