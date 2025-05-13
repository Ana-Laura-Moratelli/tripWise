import { RequestHandler } from "express";
import { db } from "../services/firebase";

export const createPhotoNote: RequestHandler = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { fotoUrl, anotacao } = req.body;

        if (!fotoUrl && !anotacao) {
            res.status(400).json({ error: "É necessário informar a foto ou a anotação." });
            return;
        }

        const tripRef = db.collection("trip").doc(tripId);
        const tripSnap = await tripRef.get();

        if (!tripSnap.exists) {
            res.status(404).json({ error: "Viagem não encontrada." });
            return;
        }

        await db.collection("photoNotes").add({
            tripId,
            fotoUrl: fotoUrl || "",
            anotacao: anotacao || "",
            criadoEm: new Date(),
        });

        res.status(200).json({ message: "Foto ou anotação adicionada com sucesso." });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Erro interno." });
    }
};


export const readPhotoNotes: RequestHandler = async (req, res) => {
    try {
        const { tripId } = req.params;

        const snapshot = await db
            .collection("photoNotes")
            .where("tripId", "==", tripId)
            .get();

        const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(notes);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Erro interno." });
    }
};

export const updatePhotoNote: RequestHandler = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { fotoUrl, anotacao } = req.body;

        const noteRef = db.collection("photoNotes").doc(noteId);
        const noteSnap = await noteRef.get();

        if (!noteSnap.exists) {
            res.status(400).json({ error: "Mensagem" });
            return;
        }

        await noteRef.update({
            fotoUrl: fotoUrl || "",
            anotacao: anotacao || "",
            atualizadoEm: new Date(),
        });

        res.status(200).json({ message: "Nota atualizada com sucesso." });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Erro interno." });
    }
};

export const deletePhotoNote: RequestHandler = async (req, res) => {
    try {
        const { noteId } = req.params;

        const noteRef = db.collection("photoNotes").doc(noteId);
        const noteSnap = await noteRef.get();

        if (!noteSnap.exists) {
            res.status(400).json({ error: "Mensagem" });
            return;
        }

        await noteRef.delete();
        res.status(200).json({ message: "Nota excluída com sucesso." });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Erro interno." });
    }
};
