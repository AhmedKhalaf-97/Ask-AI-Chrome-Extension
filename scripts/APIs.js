// Uses the Summarizer built-in API. Accepts a text string, then returns key points summary.
async function summarize(content) {
    let output = "";

    // Checks if the Summarizer is supported by the browser. 
    if ('Summarizer' in self) {
        const availability = await Summarizer.availability();

        // If not available, trigger the download of the model.
        // Otherwise, create a summarizer object.
        if (availability === 'unavailable') {
            output = "The Summarizer isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Summarizer is still downloading. Please try again.";
            Summarizer.create();
        }
        else if (availability === 'downloadable') {
            output = "The Summarizer is still downloading. Please try again.";
            Summarizer.create();
        }
        else if (availability === 'available') {
            const summarizer = await Summarizer.create({
                type: "key-points",
                length: "short",
                format: "markdown"
            });

            try {
                output = summarizer.summarizeStreaming(content);
            }
            catch (error) {
                output = "Input is too large or the Summarizer is not available right now. Please try again.";
            }
        }
    }
    else {
        output = "Your browser doesn't support the Summarizer API.";
    }

    return output;
}

// Uses the Proofreader built-in API. Accepts a text string, then returns the corrected text.
async function proofread(content) {
    let output = "";

    // Checks if the Proofreader is supported by the browser. 
    if ('Proofreader' in self) {
        const availability = await Proofreader.availability();

        // If not available, trigger the download of the model.
        // Otherwise, create a Proofreader object.
        if (availability === 'unavailable') {
            output = "The Proofreader isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Proofreader is still downloading. Please try again.";
            Proofreader.create();
        }
        else if (availability === 'downloadable') {
            output = "The Proofreader is still downloading. Please try again.";
            Proofreader.create();
        }
        else if (availability === 'available') {
            const proofreader = await Proofreader.create({
                expectedInputLanguages: ['en'],
            });

            try {
                const proofreadResult = await proofreader.proofread(content);
                output = "<strong>Corrected text:</strong><br><br>";
                output += proofreadResult.correctedInput;

                output += "<br><br><hr><br><strong>Original text:</strong>"

                let inputtedText = content;
                let offset = 0;
                for (const correction of proofreadResult.corrections) {
                    inputtedText = inputtedText.slice(0, correction.startIndex + offset) + "<mark>" + inputtedText.slice(correction.startIndex + offset);
                    offset += 6;
                    inputtedText = inputtedText.slice(0, correction.endIndex + offset) + "</mark>" + inputtedText.slice(correction.endIndex + offset);
                    offset += 7;
                }

                output += `<br><br>${inputtedText}`;

                output += "<br><br><strong><i>*Corrections are highlighted above.</i></strong>";

                output += "<br><br><strong>Corrections made:</strong>";

                let i = 0;
                for (const correction of proofreadResult.corrections) {
                    output += `<br>${++i}. ${correction.correction}`;
                }
            }
            catch (error) {
                output = "Input is too large or the Proofreader is not available right now. Please try again.";
            }
        }
    }
    else {
        output = "Your browser doesn't support the Proofreader API.";
    }

    return output;
}

// Uses the LanguageDetector built-in API. Accepts a text string, then returns a BCP 47 language code.
async function detectLanguage(content) {
    let output = "";
    
    // Checks if the LanguageDetector is supported by the browser. 
    if ('LanguageDetector' in self) {
        const availability = await LanguageDetector.availability();

        // If not available, trigger the download of the model.
        // Otherwise, create a LanguageDetector object.
        if (availability === 'unavailable') {
            output = "The Language Detector isn't available right now. Please try again.";
        }
        else {
            const langDetector = await LanguageDetector.create();

            try {
                const detectionResults = await langDetector.detect(content);
                output = detectionResults[0].detectedLanguage;
            }
            catch (error) {
                output = "Input is too large or the Language Detector is not available right now. Please try again.";
            }
        }
    }
    else {
        output = "Your browser doesn't support the Language Detector API.";
    }

    return output;
}

// Uses the Translator built-in API. Accepts a text string, source language (BCP 47 language code), and target language (BCP 47 language code).
//  Then, returns the translated text.
async function translate(content, sourceLang, targetLang) {
    let output = "";

    // Checks if the Translator is supported by the browser. 
    if ('Translator' in self) {
        const availability = await Translator.availability({
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
        });

        // If not available, trigger the download of the model.
        // Otherwise, create a Translator object.
        if (availability === 'unavailable') {
            output = "The Translator isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Translator is still downloading. Please try again.";
             Translator.create({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
            });
        }
        else if (availability === 'downloadable') {
            output = "The Translator is still downloading. Please try again.";
             Translator.create({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
            });
        }
        else if (availability === 'available') {
            const translator = await Translator.create({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
            });

            try {
                output = translator.translateStreaming(content);
            }
            catch (error) {
                output = "Input is too large or the Translator is not available right now. Please try again.";
            }
        }
        else {
            output = "The Translator is still downloading or isn't available right now. Please try again.";
        }
    }
    else {
        output = "Your browser doesn't support the Translator API.";
    }

    return output;
}

// Uses the Rewriter built-in API. Accepts a text string tone and length. Then, returns the rewritten text.
async function rewrite(content, tone, length) {
    let output = "";

    // Checks if the Rewriter is supported by the browser. 
    if ('Rewriter' in self) {
        const availability = await Rewriter.availability();

        // If not available, trigger the download of the model.
        // Otherwise, create a Rewriter object.
        if (availability === 'unavailable') {
            output = "The Rewriter isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Rewriter is still downloading. Please try again.";
             Rewriter.create();
        }
        else if (availability === 'downloadable') {
            output = "The Rewriter is still downloading. Please try again.";
             Rewriter.create();
        }
        else if (availability === 'available') {
            const rewriter = await Rewriter.create({
                tone: tone,
                length: length,
                format: "plain-text"
            });

            try {
                output = rewriter.rewriteStreaming(content);
            }
            catch (error) {
                output = "Input is too large or the Rewriter is not available right now. Please try again.";
            }
        }
        else {
            output = "The Rewriter is still downloading or isn't available right now. Please try again.";
        }
    }
    else {
        output = "Your browser doesn't support the Rewriter API.";
    }

    return output;
}

// Uses the Writer built-in API. Accepts an input string tone and length. Then, returns the generated response text.
async function writer(input, tone, length) {
    let output = "";
        
    // Checks if the Writer is supported by the browser. 
    if ('Writer' in self) {
        const availability = await Writer.availability();

        // If not available, trigger the download of the model.
        // Otherwise, create a Writer object.
        if (availability === 'unavailable') {
            output = "The Writer isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Writer is still downloading. Please try again.";
             Writer.create();
        }
        else if (availability === 'downloadable') {
            output = "The Writer is still downloading. Please try again.";
             Writer.create();
        }
        else if (availability === 'available') {
            const writer = await Writer.create({
                tone: tone,
                length: length,
                format: "markdown"
            });

            try {
                output = writer.writeStreaming(input);
            }
            catch (error) {
                output = "Input is too large or the Writer is not available right now. Please try again.";
            }
        }
        else {
            output = "The Writer is still downloading or isn't available right now. Please try again.";
        }
    }
    else {
        output = "Your browser doesn't support the Writer API.";
    }

    return output;
}

// Uses the LanguageModel built-in API. Accepts an input string (prompt). Then, returns the generated response text.
async function prompt(input) {
    let output = "";

    // Checks if the LanguageModel is supported by the browser. 
    if ('LanguageModel' in self) {
        const availability = await LanguageModel.availability();

        // If not available, trigger the download of the model.
        // Otherwise, create a LanguageModel object.
        if (availability === 'unavailable') {
            output = "The Prompt API isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Prompt API is still downloading. Please try again.";
             LanguageModel.create();
        }
        else if (availability === 'downloadable') {
            output = "The Prompt API is still downloading. Please try again.";
             LanguageModel.create();
        }
        else if (availability === 'available') {
            const params = await LanguageModel.params();
            const session = await LanguageModel.create({
                temperature: params.defaultTemperature,
                topK: params.defaultTopK,
            });

            try {
                output = session.promptStreaming(input);
            }
            catch (error) {
                output = "The Prompt API is not available right now. Please try again.";
            }
        }
        else {
            output = "The Prompt API is still downloading or isn't available right now. Please try again.";
        }
    }
    else {
        output = "Your browser doesn't support the Writer API.";
    }

    return output;
}