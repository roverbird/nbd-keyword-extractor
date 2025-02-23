// outputHandler.js
//License
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, 
//including without limitation the rights to use, copy, modify, merge, publish of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//**2024 Copyright of Center Glas and Alexandre Sotov:**
//The Software is the intellectual property of Center Glas and Alexandre Sotov. The use of the name "Center Glas" or any associated trademarks does not imply endorsement or support for the modified software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

let wordCount; // Define wordCount as a global variable

function calculateStatistics(output, wordCount) {
    wordCount = output.wordCount;
    //console.log(wordCount);


    const words = Object.keys(output.words);
    const data = output.words;
    const outputObject = {
        word: [],
        TF: [],
        mean: [],
        variance: [],
        k: [],
        p: [],
        sqrt_kp: [],
        q_p: [],
        cmi: [],
        DF: [],
        DF_TF: [],
        TF_IDF: [],
        entropy: [],
        fisher: [],
        //r_fisher: [],
    };

    const totalDocuments = data[words[0]].length;

    for (const word of words) {
        const colValues = data[word];
        const t = colValues.length;
        const summa = colValues.reduce((acc, value) => acc + value, 0);
        const mean = summa / t;
        const variance = colValues.reduce((acc, x) => acc + (x - mean) ** 2, 0) / (t - 1);
        let k = Math.abs(((mean**2) / (variance - mean))) || Infinity;
        let p = (mean / variance) || Infinity;
        let sqrt_kp = Math.sqrt((k**2) + (p**2));
        let q = 1 - p;
        let q_p = (q / p) >= 0 ? (q / p) : Infinity;
        let fisher = (k / (p ** 2));
        //let r_fisher = 1 / fisher;

        if (q < 0) q = Infinity;
        if (k > 200) k = Infinity;
        if (p > 3) p = Infinity;
        if (sqrt_kp > 200) sqrt_kp = Infinity;
        if (fisher > 200) fisher = Infinity;

        const DF = colValues.filter(count => count !== 0).length;
        const DF_TF = (1 / (DF / summa)) || Infinity;
        const entropy = -colValues.filter(count => count !== 0)
            .reduce((acc, count) => acc + (count / summa) * Math.log(count / summa), 0);
        const TF_IDF = mean * (1 + DF_TF);

        // Define the weight for 'p', 'k', and the penalty term
        //const weight_p = 0.8; // Adjust as needed
        //const weight_k = 0.5; // Adjust as needed
        //const penalty_weight = 0.1; // Adjust as needed

        // Calculate the ratio of k to p
        //const k_p_ratio = k / p;

        // Calculate the composite meaning index with weighted 'p', 'k', and the penalty term
        const cmi = Math.sqrt(k**2 + p**2 + mean ** 2 + fisher ** 2);

        outputObject.word.push(word);
        outputObject.TF.push(summa);
        outputObject.mean.push(mean.toFixed(4));
        outputObject.variance.push(variance.toFixed(4));
        outputObject.k.push(k.toFixed(4));
        outputObject.p.push(p.toFixed(4));
        outputObject.sqrt_kp.push(sqrt_kp.toFixed(4));
        outputObject.q_p.push(q_p.toFixed(4));
        outputObject.fisher.push(fisher.toFixed(4));
        outputObject.cmi.push(cmi.toFixed(4));
        outputObject.DF.push(DF);
        outputObject.DF_TF.push(DF_TF.toFixed(4));
        outputObject.TF_IDF.push(TF_IDF.toFixed(4));
        outputObject.entropy.push(entropy.toFixed(4));
        //outputObject.r_fisher.push(r_fisher.toFixed(4));
    }

    const averages = calculateAverages(outputObject);
    outputObject.averages = averages;

    return outputObject;
}

function calculateAverages(outputObject) {
    const averages = {};

    for (const property in outputObject) {
        if (outputObject.hasOwnProperty(property) && Array.isArray(outputObject[property])) {
            const values = outputObject[property];
            const numericValues = values.slice(1).map(val => parseFloat(val)).filter(value => !isNaN(value) && value !== Infinity);
            if (numericValues.length > 0) {
                const sum = numericValues.reduce((sum, value) => sum + value, 0);
                const mean = sum / numericValues.length;
                averages[property] = mean.toFixed(4);
            }
        }
    }

    return averages;
}

let outputStatistics;
let statisticsAverages;

function handleOutput(output) {
    outputStatistics = calculateStatistics(output);
    statisticsAverages = outputStatistics.averages || {};  // access averages, or set to empty object
    // Display the statistics and averages in the outputStatistics div as a table
    const outputStatisticsDiv = document.getElementById('outputStatistics');
    outputStatisticsDiv.innerHTML = generateStatisticsTable(outputStatistics, statisticsAverages);
}

function generateStatisticsTable(outputStatistics, statisticsAverages) {
    const statisticsNames = Object.keys(outputStatistics).slice(1);
    const sortCriterion = document.getElementById('sortCriterion').value;
    const sortCriterionIndex = statisticsNames.indexOf(sortCriterion);
    const rows = outputStatistics.word.map((word, i) => ({
        word: word,
        criterionValue: outputStatistics[sortCriterion][i],
        values: statisticsNames.map(stat => outputStatistics[stat][i])
    }));
    rows.sort((a, b) => a.criterionValue - b.criterionValue);
    const minCriterionValue = Math.min(...rows.map(row => row.criterionValue));

    // Fetch stoplist from URL
    function fetchStoplist(url) {
        return new Promise((resolve, reject) => {
            fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(stoplist => {
                resolve(stoplist.split('\n').map(word => word.trim().toLowerCase()));
            })
            .catch(error => {
                console.error('Error fetching stoplist:', error);
                resolve([]);
            });
        });
    }

    // Word Cloud

    const colorMap = ['#4caf50', '#009688', '#00bcd4', '#FF84CC', '#ffc107', '#ff9800', '#f44336'];

    // Function to create word cloud
    function createWordCloud(rows) {
        const cloudSize = 50;
        const maxWFrequency = Math.max(...rows.slice(0, cloudSize).map(row => row.values[0]));
        return fetchStoplist('/free-online-keyword-extractor/stoplist.txt')
        .then(stoplist => {
            const wordCloudContainer = document.createElement('div');
            rows.slice(0, cloudSize).forEach((row, index) => {
                if (!stoplist.includes(row.word.toLowerCase())) {
                    const scaleFactor = row.values[0] / maxWFrequency;
                    let fontSize = 85 * scaleFactor;
                    fontSize = Math.max(fontSize, 14);
                    const wordCloudItem = document.createElement('span');
                    wordCloudItem.textContent = row.word + ' ';
                    wordCloudItem.style.fontSize = `${fontSize}px`;
                    const df = row.values[8];
                    const colorIndex = df % colorMap.length;
                    wordCloudItem.style.color = colorMap[colorIndex];
                    wordCloudItem.classList.add('word-cloud-item');
                    wordCloudContainer.appendChild(wordCloudItem);
                }
            });
            return wordCloudContainer;
        });
    }

    // Execute word cloud creation
    createWordCloud(rows).then(wordCloudContainer => {
        const existingWordCloud = document.getElementById('wordCloud');
        existingWordCloud.innerHTML = '';
        existingWordCloud.appendChild(wordCloudContainer);
    });

    // KWIC Part
    const inputText = window.sharedData.inputText;
    const cleanData = inputText.replace(/<[^>]*>|[^\w\s\p{L}]/gu, ' ');
    const words = cleanData.toLowerCase().match(/\p{L}+/gu);
    function generateKWIC(word) {
        const index = words.indexOf(word);
        if (index !== -1) {
            const contextWords = words.slice(Math.max(0, index - 8), index).concat(`<span class="has-background-warning-light is-size-4"> ${word} </span>`, words.slice(index + 1, index + 9));
            return contextWords.join(' ');
        }
        return '';
    }
    const kwicPrint = rows.slice(0, 10).map(row => ({
        word: row.word,
        kwic: generateKWIC(row.word)
    }));
    const kwicHTML = generateKWICHTML(kwicPrint);
    document.getElementById('kwicResults').innerHTML = kwicHTML;

    // Generate HTML table
    let tableHTML = '<table class="table is-narrow is-striped is-hoverable"><thead><tr>';
    tableHTML += '<th>Word</th>';
    for (const statName of statisticsNames) {
        if (statName !== 'averages') {
            tableHTML += `<th>${statName}</th>`;
        }
    }
    tableHTML += '</tr></thead><tbody>';
    for (const row of rows) {
        tableHTML += '<tr>';
        tableHTML += `<td>${row.word}</td>`;
        for (const value of row.values) {
            if (typeof value !== 'undefined') {
                const isSortCriterion = row.values.indexOf(row.criterionValue) === sortCriterionIndex;
                const shouldHighlight = isSortCriterion && row.criterionValue <= (minCriterionValue + 0.5 * minCriterionValue);
                tableHTML += `<td${shouldHighlight ? ' class="highlight"' : ''}>${value}</td>`;
            }
        }
        tableHTML += '</tr>';
    }
    tableHTML += '<tr>';
    tableHTML += '<td><strong>Averages</strong></td>';
    for (const averageValue of Object.values(statisticsAverages)) {
        tableHTML += `<td>${averageValue}</td>`;
    }
    tableHTML += '</tr></tbody></table>';
    return tableHTML;
}

function generateCSVData(outputStatistics, statisticsAverages) {
    // Extract statistics names from the first row
    const statisticsNames = Object.keys(outputStatistics).slice(1);

    // Get the selected sorting criterion from the dropdown
    const sortCriterion = document.getElementById('sortCriterion').value;

    // Get the index of the selected criterion for sorting
    const sortCriterionIndex = statisticsNames.indexOf(sortCriterion);

    // Create an array of objects with word and selected criterion values
    const rows = outputStatistics.word.map((word, i) => ({
        word: word,
        criterionValue: outputStatistics[sortCriterion][i],
        values: statisticsNames.map(stat => outputStatistics[stat][i])
    }));

    // Sort the rows based on the selected criterion values
    rows.sort((a, b) => a.criterionValue - b.criterionValue);

    // Generate the CSV data
    let csvData = 'Word,' + statisticsNames.join(',') + '\n';

    // Add rows with word and statistics values
    for (const row of rows) {
        csvData += `${row.word},${row.values.join(',')}\n`;
    }

    // Add a row for averages
    csvData += 'Averages,' + Object.values(statisticsAverages).join(',') + '\n';

    return csvData;
}

function downloadData() {
    // Get the outputStatistics div
    const outputStatisticsDiv = document.getElementById('outputStatistics');

    // Generate the CSV data
    const csvData = generateCSVData(outputStatistics, statisticsAverages);

    // Create a Blob containing the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Set the link's attributes for downloading
    a.href = url;
    a.download = 'textvisualizationapp-keyword-extraction.csv';

    // Append the link to the body
    document.body.appendChild(a);

    // Trigger a click on the link to start the download
    a.click();

    // Remove the link from the body
    document.body.removeChild(a);

    // Revoke the Blob URL to free up resources
    URL.revokeObjectURL(url);
}

function generateKWICHTML(kwicResults) {
    // Create an empty string to store the HTML
    let html = '';
    
    // Iterate over each KWIC result
    kwicResults.forEach(result => {
        // Generate Bulma-styled HTML for the KWIC result
        html += `
            <div class="box">
                <!---<p><strong>${result.word}</strong></p>--->
                <p>${result.kwic}</p>
            </div>
        `;
    });

    return html; // Return the generated HTML
}

