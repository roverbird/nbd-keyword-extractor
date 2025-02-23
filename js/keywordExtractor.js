// Define a global object to store inputText
window.sharedData = {
    inputText: ""
};

const DEFAULT_CHUNK_SIZE = 100;
const DEFAULT_MIN_FREQUENCY = 5;
const MAX_FREQUENCY = 1000000;
//const MIN_TEXT_SIZE_SMALL = 5000;
//const MIN_TEXT_SIZE_MEDIUM = 50000;
//const MIN_TEXT_SIZE_LARGE = 150000;
//const MIN_TEXT_SIZE_XLARGE = 200000;
const MIN_INPUT_SIZE = 2000;
const MAX_INPUT_SIZE = 10000;
const CHUNK_SIZE_DIVISOR = 7;
const MAX_DEFAULT_CHUNK_SIZE = 1800;

function analyzeText() {
    const chunkInput = document.getElementById('chunkInput');
    const defaultChunkSize = parseInt(chunkInput.getAttribute('data-default-size'), 10) || DEFAULT_CHUNK_SIZE;
    const chunk = parseInt(chunkInput.value, 10) || defaultChunkSize;

    const minFrequencyInput = document.getElementById('minFrequencyInput');
    const minFrequency = parseInt(minFrequencyInput.value, 10) || DEFAULT_MIN_FREQUENCY;

    const inputText = document.getElementById('inputText').value;
    window.sharedData.inputText = inputText;

    const wordOccurrencesByChunk = new Map();
    const wordFrequencyMap = new Map();
    let chunkCount = 0;

    const cleanData = inputText.replace(/<[^>]*>|[^\w\s\p{L}]/gu, ' ');
    const words = cleanData.toLowerCase().match(/\p{L}+/gu);

    for (let i = 0; i < words.length; i += chunk) {
        const currentChunk = words.slice(i, i + chunk);

        chunkCount += 1;
        for (const word of currentChunk) {
            const key = `${chunkCount}-${word}`;
            wordOccurrencesByChunk.set(key, (wordOccurrencesByChunk.get(key) || 0) + 1);
            wordFrequencyMap.set(word, (wordFrequencyMap.get(word) || 0) + 1);
        }
    }

    for (const [word, freq] of wordFrequencyMap.entries()) {
        if (freq < minFrequency || freq > MAX_FREQUENCY) {
            wordFrequencyMap.delete(word);
        }
    }

    const output = {
        words: {},
        wordCount: words.length
    };

    for (const [word, occurrences] of wordFrequencyMap.entries()) {
        output.words[word] = [...Array(chunkCount)].map((_, i) => wordOccurrencesByChunk.get(`${i + 1}-${word}`) || 0);
    }

    handleOutput(output);
}

function updateInputSize() {
    const inputText = document.getElementById('inputText').value;

    const cleanedText = inputText.toLowerCase().replace(/[^\p{L}\s]/gu, '').replace(/<.*?>/g, '');
    const words = cleanedText.match(/\p{L}+/gu) || [];

    const wordCount = words.length;

    const inputSizeElement = document.getElementById('inputSize');
    inputSizeElement.textContent = `Word Count: ${wordCount}`;
    
    const inputWarningElement = document.getElementById('inputWarning');
    inputWarningElement.textContent = wordCount < MIN_INPUT_SIZE ? 'Warning, small sample. Try. Or paste same text twice. Or paste several different texts together and press Run' : '';

    const inputCheerElement = document.getElementById('inputCheer');
    inputCheerElement.textContent = wordCount > MAX_INPUT_SIZE ? 'Good text. Setting Min Word Frequency to larger values.' : '';

    // Adjust minFrequencyInput based on wordCount
    const minFrequencyInput = document.getElementById('minFrequencyInput');
    if (wordCount > 10000 && wordCount < 50000) {
        minFrequencyInput.value = 10;
    } else if (wordCount >= 50000 && wordCount < 200000) {
        minFrequencyInput.value = 40;
    } else if (wordCount >= 200000) {
        minFrequencyInput.value = 50;
    } else {
        minFrequencyInput.value = 5; // Default value for small word counts
    }


    updateDefaultChunkSize();
}

function updateDefaultChunkSize() {
    const inputSize = parseInt(document.getElementById('inputSize').textContent.split(' ')[2], 10) || 0;
    let defaultChunkSize = Math.min(MAX_DEFAULT_CHUNK_SIZE, Math.max(1, Math.floor(inputSize / CHUNK_SIZE_DIVISOR)));

    const chunkInput = document.getElementById('chunkInput');
    chunkInput.setAttribute('data-default-size', defaultChunkSize);
    chunkInput.placeholder = `Default: ${defaultChunkSize}`;
}

function clearInput() {
    const inputTextElement = document.getElementById('inputText');
    const chunkInputElement = document.getElementById('chunkInput');
    const inputSizeElement = document.getElementById('inputSize');
    const outputStatisticsElement = document.getElementById('outputStatistics');
    const wordCloudElement = document.getElementById('wordCloud');
    const kwicResultsElement = document.getElementById('kwicResults');

    inputTextElement.value = '';
    chunkInputElement.value = '';
    inputSizeElement.textContent = '';
    outputStatisticsElement.innerHTML = '';
    wordCloudElement.innerHTML = '';
    kwicResultsElement.innerHTML = '';
}

function setDefaults() {
    const chunkInput = document.getElementById('chunkInput');
    const defaultChunkSize = parseInt(chunkInput.getAttribute('data-default-size'), 10) || DEFAULT_CHUNK_SIZE;
    chunkInput.value = defaultChunkSize;

    const minFrequencyInput = document.getElementById('minFrequencyInput');
    minFrequencyInput.value = DEFAULT_MIN_FREQUENCY;
}

function copyWordCloud() {
    const wordCloudContent = document.getElementById('wordCloud').innerText;

    const textarea = document.createElement('textarea');
    textarea.value = wordCloudContent;

    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    document.execCommand('copy');
}

