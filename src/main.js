import * as dsv from "d3-dsv";
import * as fetch from "d3-fetch";

const ssv = dsv.dsvFormat(";");

Promise.all([fetch.json("/data/data.json"), fetch.json("/data/codes.json")]).then((data) => {
    const reports = data[0];
    const codes = data[1];

    Promise.all(reports.map(report => fetch.text(report["file"])
        .then(txt => ssv.parseRows(txt, row => {
            return {
                "year": report["year"],
                "quarterShort": report["quarter"],
                "quarter": report["year"] + " " + report["quarter"],
                "date": row[10],
                "label": row[0],
                "code": row[1],
                "title": codes[row[1]]||row[4],
                "platform": row[7],
                "type": row[8],
                "country": row[9],
                "qty": row[11],
                "amount": row[12]
            }
        }))
    )).then(reportsByQuarter => {
        analyseReports(reportsByQuarter.flat())
    });
});

function analyseReports(reports) {
    // save("report.csv", dsv.csvFormat(reports.sort((a, b) => a["date"] - b["date"])));
    countBy(reports, "date", "name");
}

function countBy(reports, countBy, sortBy) {
    let byPlatform = {};
    let totalQty = 0;
    let totalAmount = 0;
    reports.forEach(r => {
        let qty = parseInt(r["qty"]);
        let amount = parseFloat(r["amount"].replace(",","."));
        let byName = r[countBy];
        if (!byPlatform[byName]) {
            byPlatform[byName] = {"qty": qty, "amount": amount};
        } else {
            byPlatform[byName]["qty"] += qty;
            byPlatform[byName]["amount"] += amount;
        }
        totalQty+=qty;
        totalAmount+=amount;
    });
    let totals = [];
    for (let pName in byPlatform) {
        if(Object.prototype.hasOwnProperty.call(byPlatform, pName)) {
            var platform = byPlatform[pName];
            totals.push({"name": pName, "qty": platform["qty"], "amount": platform["amount"]});
            console.log(pName + " qty:" + platform["qty"]+", amount:"+platform["amount"]);
        }
    }
    totals = totals.sort((a, b) => a[sortBy]-b[sortBy]);
    totals.push({"name":"---", "qty": "---", "amount":"---"});
    totals.push({"name":"TOTAL", "qty": totalQty, "amount":totalAmount});
    save("totals-by-"+countBy+".csv", dsv.csvFormat(totals));
}

function save(filename, data) {
    var blob = new Blob([data], {type: 'text/csv'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}