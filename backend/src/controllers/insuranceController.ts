import { RequestHandler } from "express";
import { db } from "../services/firebase";

export const createInsurance: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { seguradora, numeroApolice, dataInicio, dataFim, telefoneEmergencia, valor, observacoes } = req.body;

    if (!seguradora || !numeroApolice || !dataInicio || !dataFim || !telefoneEmergencia || !valor) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const tripRef = db.collection("trip").doc(tripId);
    const tripSnap = await tripRef.get();

    if (!tripSnap.exists) {
      res.status(404).json({ error: "Viagem não encontrada." });
      return;
    }

    await db.collection("insurance").add({
      tripId,
      seguradora,
      numeroApolice,
      dataInicio,
      dataFim,
      telefoneEmergencia,
      valor,
      observacoes,
      criadoEm: new Date(),
    });

    res.status(200).json({ message: "Seguro adicionado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao adicionar seguro:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};

export const readInsurance: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;

    const snapshot = await db
      .collection("insurance")
      .where("tripId", "==", tripId)
      .get();

    const insurances = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(insurances);
  } catch (error: any) {
    console.error("Erro ao buscar seguros:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};

export const updateInsurance: RequestHandler = async (req, res) => {
  try {
    const { insuranceId } = req.params;
    const { seguradora, numeroApolice, dataInicio, dataFim, telefoneEmergencia, valor, observacoes } = req.body;

    if (!seguradora || !numeroApolice || !dataInicio || !dataFim || !telefoneEmergencia || !valor) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const insuranceRef = db.collection("insurance").doc(insuranceId);
    const insuranceSnap = await insuranceRef.get();

    if (!insuranceSnap.exists) {
      res.status(404).json({ error: "Seguro não encontrado." });
      return;
    }

    await insuranceRef.update({
      seguradora,
      numeroApolice,
      dataInicio,
      dataFim,
      telefoneEmergencia,
      valor,
      observacoes: observacoes || "",
      atualizadoEm: new Date(),
    });

    res.status(200).json({ message: "Seguro atualizado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao atualizar seguro:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};

export const deleteInsurance: RequestHandler = async (req, res) => {
  try {
    const { insuranceId } = req.params;

    const insuranceRef = db.collection("insurance").doc(insuranceId);
    const insuranceSnap = await insuranceRef.get();

    if (!insuranceSnap.exists) {
      res.status(404).json({ error: "Seguro não encontrado." });
      return;
    }

    await insuranceRef.delete();

    res.status(200).json({ message: "Seguro excluído com sucesso." });
  } catch (error: any) {
    console.error("Erro ao deletar seguro:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};
