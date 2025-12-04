export const getWeeklyKey = (date: Date) => {
    const year = date.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const week = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
    return `${year}-W${week}`;
};

export const getMonthlyKey = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
};

export const getQuarterlyKey = (date: Date) => {
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    return `${year}-Q${quarter}`;
};

export const getHalfYearKey = (date: Date) => {
    const year = date.getFullYear();
    const half = date.getMonth() < 6 ? "H1" : "H2";
    return `${year}-${half}`;
};
