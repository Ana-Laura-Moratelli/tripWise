import { RequestHandler } from "express";
import { db } from "../services/firebase";

export const adicionarDocumento: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { tipo, numero, validade, observacoes } = req.body;

    if (!tipo || !numero || !validade) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const tripRef = db.collection("trip").doc(tripId);
    const tripSnap = await tripRef.get();

    if (!tripSnap.exists) {
      res.status(404).json({ error: "Viagem não encontrada." });
      return;
    }

    await db.collection("documents").add({
      tripId,
      tipo,
      numero,
      validade,
      observacoes,
      criadoEm: new Date(),
    });

    res.status(200).json({ message: "Documento adicionado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao adicionar documento:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};


export const listarDocumentos: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;

    const snapshot = await db
      .collection("documents")
      .where("tripId", "==", tripId)
      .get();

    const documentos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(documentos);
  } catch (error: any) {
    console.error("Erro ao buscar documentos:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};



export const atualizarDocumento: RequestHandler = async (req, res) => {
  try {
    const { docId } = req.params;
    const { tipo, numero, validade, observacoes } = req.body;

    if (!tipo?.trim() || !numero?.trim() || !validade?.trim()) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const docRef = db.collection("documents").doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ error: "Documento não encontrado." });
      return;
    }

    await docRef.update({
      tipo,
      numero,
      validade,
      observacoes: observacoes || "", 
      atualizadoEm: new Date(),
    });

    res.status(200).json({ message: "Documento atualizado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao atualizar documento:", error);
    res.status(500).json({ error: error.message || "Erro interno ao atualizar o documento." });
  }
};
export const deletarDocumento: RequestHandler = async (req, res) => {
  try {
    const { docId } = req.params;

    const docRef = db.collection("documents").doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ error: "Documento não encontrado." });
      return;
    }

    await docRef.delete();

    res.status(200).json({ message: "Documento excluído com sucesso." });
  } catch (error: any) {
    console.error("Erro ao deletar:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};
