const admin = require('firebase-admin');
const db = admin.firestore();

async function getUserByEmail(email) {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) return null;
    return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
    };
}

async function createUser(userData) {
    const userRef = await db.collection('users').add(userData);
    const userDoc = await userRef.get();
    return {
        id: userRef.id,
        ...userDoc.data()
    };
}

async function updateUser(userId, userData) {
    const userRef = db.collection('users').doc(userId);
    await userRef.update(userData);
}

module.exports = {
    getUserByEmail,
    createUser,
    updateUser
};