function currency(num: number, currency: string){
    return num.toFixed(2) + currency;
}

function percent(num: number){
    return num.toFixed(2) + "%";
}

export default {
    currency,
    percent
}