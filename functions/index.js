const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

exports.tailorResume = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.data()?.hasPaid) throw new functions.https.HttpsError('permission-denied', 'Payment required');
    const {resumeText, jobDesc} = data;
    const KEY = functions.config().gemini.key;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({contents: [{parts: [{text: `Tailor resume.\n\nRESUME:\n${resumeText}\n\nJOB:\n${jobDesc}`}]}]})
    });
    const result = await res.json();
    return {success: true, tailoredText: result.candidates[0].content.parts[0].text};
});

exports.interviewChat = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.data()?.hasPaid) throw new functions.https.HttpsError('permission-denied', 'Payment required');
    const {message} = data;
    const KEY = functions.config().gemini.key;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({contents: [{parts: [{text: `Interview coach. User: ${message}`}]}]})
    });
    const result = await res.json();
    return {success: true, response: result.candidates[0].content.parts[0].text};
});