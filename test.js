//untuk testing code yang belum familiar
// const today = new Date();
// const yyyy = today.getFullYear();
// let mm = today.getMonth() + 1; // Months start at 0!
// let dd = today.getDate();

// if (dd < 10) dd = '0' + dd;
// if (mm < 10) mm = '0' + mm;

// const formattedToday = dd + '' + mm + '' + yyyy;
// console.log("INV"+formattedToday+"-"+1)

function handler(formattedDate){
    const currentDate = new Date(formattedDate)
    currentDate.setDate(currentDate.getDate() + 1)
    const yyyy = currentDate.getFullYear();
    let mm = currentDate.getMonth() + 1; // Months start at 0!
    let dd = currentDate.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return yyyy + "-" + mm + '-' + dd;
}

console.log(new Date("2023-04-05"))