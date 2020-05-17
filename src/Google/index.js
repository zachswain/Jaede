const { GoogleSpreadsheet } = require('google-spreadsheet');
const dateformat = require("dateformat");

const creds = require('../../googlecredentials.json'); // the file saved above
const doc = new GoogleSpreadsheet('1xZZ4cIOYFLR7bQkRz5Rv05iFebi6He57j4UeCe7-Tfo');
doc.useServiceAccountAuth(creds).then(() => {
    doc.loadInfo().then(() => {
        console.log(doc.title);
        
        doc.addSheet().then(sheet => {
            var rightNow = new Date();
            sheet.updateProperties({ title : `Macguffin Report - ${dateformat(rightNow, "yyyy-mm-dd")}` });
            
            sheet.loadCells('A1:D5').then(() => {
                const cellA1 = sheet.getCell(0, 0);
                cellA1.value = "Name";
                const cellC3 = sheet.getCellByA1('C3');
                cellC3.value ="foo";
                
                sheet.saveUpdatedCells().then().catch();
            });
        });
    }).catch(console.error);
}).catch(console.error);