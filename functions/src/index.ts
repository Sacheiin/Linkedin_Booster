/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
/*import * as functions from "firebase-functions";
import axios from "axios";
import { Request, Response } from "express";  // Import from express

export const geminiProxy = functions.https.onRequest(
  //async (req: Request, res: Response) => {
    const prompt = req.body.prompt;
    const GEMINI_KEY = functions.config().gemini.key;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );
      res.status(200).send(response.data);
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).send("Error calling Gemini");
    }
  }
);*/
