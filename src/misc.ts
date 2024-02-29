function julianIntToDate(n: number): Date {
    // convert a Julian number to a Gregorian Date.
    //    S.Boisseau / BubblingApp.com / 2014
    const a = n + 32044;
    const b = Math.floor(((4 * a) + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor(((4 * c) + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const f = Math.floor(((5 * e) + 2) / 153);

    const D = e + 1 - Math.floor(((153 * f) + 2) / 5);
    const M = f + 3 - 12 - Math.round(f / 10);
    const Y = (100 * b) + d - 4800 + Math.floor(f / 10);

    return new Date(Y,M,D);
}


export {julianIntToDate}