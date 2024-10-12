export function generatePlacement(num:number) {
    switch (num) {
        case 11:
        case 12:
            return num.toString() + "th"
        default:
            break;
    }
    switch (num % 10) {
        case 1:
            return num.toString() + "st"
        case 2:
            return num.toString() + "nd"
        default:
            return num.toString() + "th"
    }
}