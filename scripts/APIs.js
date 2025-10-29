async function summarize(content) {
    let output = "";

    if ('Summarizer' in self) {
        // The Summarizer API is supported.

        const availability = await Summarizer.availability();
        if (availability === 'unavailable') {
            // The Summarizer API isn't usable.
            output = "The Summarizer isn't available right now. Please try again.";
        }
        else {
            const summarizer = await Summarizer.create({
                type: "key-points",
                length: "short",
                format: "markdown"
            });

            try {
                output = await summarizer.summarize(content);
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


async function proofread(content) {
    let output = "";

    if ('Proofreader' in self) {
        const availability = await Proofreader.availability();

        if (availability === 'unavailable') {
            output = "The Proofreader isn't available right now. Please try again.";
        }
        else {
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

async function detectLanguage(content) {
    let output = "";

    if ('LanguageDetector' in self) {
        const availability = await LanguageDetector.availability();

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

async function translate(content, sourceLang, targetLang) {
    let output = "";

    if ('Translator' in self) {
        const availability = await Translator.availability({
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
        });

        if (availability === 'unavailable') {
            output = "The Translator isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Translator is still downloading. Please try again.";
            await Translator.create({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
            });
        }
        else if (availability === 'downloadable') {
            output = "The Translator is still downloading. Please try again.";
            await Translator.create({
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
                output = await translator.translate(content);
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

async function rewrite(content, tone, length) {
    let output = "";

    if ('Rewriter' in self) {
        const availability = await Rewriter.availability();

        if (availability === 'unavailable') {
            output = "The Rewriter isn't available right now. Please try again.";
        }
        else if (availability === 'downloading') {
            output = "The Rewriter is still downloading. Please try again.";
            await Translator.create({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
            });
        }
        else if (availability === 'downloadable') {
            output = "The Rewriter is still downloading. Please try again.";
            await Translator.create({
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
            });
        }
        else if (availability === 'available') {
            const rewriter = await Rewriter.create({
                tone: tone,
                length: length,
                format: "plain-text"
            });

            try {
                output = await rewriter.rewrite(content);
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


async function writer(input, tone, length) {
    let output = "Writer is working!";

    // if ('Writer' in self) {
    //     const availability = await Writer.availability();

    //     if (availability === 'unavailable') {
    //         output = "The Rewriter isn't available right now. Please try again.";
    //     }
    //     else if (availability === 'downloading') {
    //         output = "The Rewriter is still downloading. Please try again.";
    //         await Translator.create({
    //             sourceLanguage: sourceLang,
    //             targetLanguage: targetLang,
    //         });
    //     }
    //     else if (availability === 'downloadable') {
    //         output = "The Rewriter is still downloading. Please try again.";
    //         await Translator.create({
    //             sourceLanguage: sourceLang,
    //             targetLanguage: targetLang,
    //         });
    //     }
    //     else if (availability === 'available') {
    //         const rewriter = await Rewriter.create({
    //             tone: tone,
    //             length: length,
    //             format: "plain-text"
    //         });

    //         try {
    //             output = await rewriter.rewrite(content);
    //         }
    //         catch (error) {
    //             output = "Input is too large or the Rewriter is not available right now. Please try again.";
    //         }
    //     }
    //     else {
    //         output = "The Rewriter is still downloading or isn't available right now. Please try again.";
    //     }
    // }
    // else {
    //     output = "Your browser doesn't support the Rewriter API.";
    // }

    return output;
}