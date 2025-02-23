# NBD Keyword Extractior

🔗 Try [Free Online Keyword Extractor](https://textvisualization.app/free-online-keyword-extractor/) 

This is a client-side javascript keyword extractor and text miner that runs in browser.

---

## Overview
This project provides a **client-side** javascript text-mining (keyword extraction) pipeline that processes large texts, such as books or email archives, directly in the browser. The extraction method relies on:

1. **Constructing a word frequency matrix** from the input text.
2. **Estimating negative binomial distribution parameters** using moments estimation methods.
3. **Identifying statistically significant words** based on the computed parameters.

All computations are performed **purely in the browser**, ensuring **privacy, speed, and efficiency** without requiring server-side processing.

---

## How It Works
### **1. Input Processing (`keywordExtractor.js`)**
#### **Feeding Input**
- The input is a **large text file** (such as a book or an email archive), loaded into the browser.
- The script preprocesses the text by:
  - Removing **HTML tags**, **punctuation**, and **non-word characters**.
  - Converting all words to **lowercase**.
  - Tokenizing the text into **individual words**.

#### **Building the Word Frequency Matrix JSON**
- A **word frequency matrix** is created, where:
  - **Rows** represent words.
  - **Columns** represent occurrences across different sections of the text.
- The frequency of each word is **counted and stored**.
- This processed data is then passed to `outputHandler.js`.

---

### **2. Statistical Analysis (`outputHandler.js`)**
- Receives the **word frequency matrix** from `keywordExtractor.js`.
- Computes the following key statistics:
  - **Mean and Variance** of word occurrences.
  - **Negative Binomial Distribution Parameters (k, p)** using moments estimation.
  - **Term Frequency-Inverse Document Frequency (TF-IDF)**.
  - **Entropy and Fisher Information Measures**.
- Ranks words based on statistical significance and relevance.
- Generates **a visual word cloud** and a **keyword-in-context (KWIC) view**.

---

## Features
✅ **Fully client-side:** No server required, ensuring **privacy** and **speed**.  
✅ **Supports large texts:** Suitable for **books, email archives**, and **long documents**.  
✅ **Statistical keyword extraction:** Uses **negative binomial distribution** and other statistical methods.  
✅ **Interactive visualization:** Generates **word clouds** and **KWIC output**.  
✅ **Downloadable output:** Extracted keywords can be **exported as CSV**.  

---

## Usage
1. Just paste your text file into the browser.
2. The script **processes** and **extracts** relevant keywords.
3. View keyword statistics, word cloud, and KWIC output.
4. Download results as a **CSV file**.

---

## Literature

🔗 [The Negative Binomial Model of Word Usage](https://www.researchgate.net/publication/290273731_The_negative_binomial_model_of_word_usage)

## Related

🔗 [Corpus_utils](https://github.com/roverbird/corpus_utils)


