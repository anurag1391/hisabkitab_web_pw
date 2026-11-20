// Get current Indian Financial Year
export function getCurrentFinancialYear() {

    const today = new Date();

    const currentYear = today.getFullYear();

    const currentMonth = today.getMonth() + 1;

    // Financial year starts in April
    const startYear =
        currentMonth >= 4
            ? currentYear
            : currentYear - 1;

    const endYear = startYear + 1;

    return `${startYear}-${String(endYear).slice(-2)}`;

}


// Get today's date
export function getTodayDate() {

    const now = new Date();

    const local = new Date(
        now.getTime() -
        now.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 10);

}