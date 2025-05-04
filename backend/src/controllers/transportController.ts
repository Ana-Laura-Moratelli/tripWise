import { RequestHandler } from "express";
import { db } from "../services/firebase";

export const createTransport: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { tipoTransporte, empresa, dataHoraPartida, dataHoraChegada, valor, observacoes, modeloVeiculo, placaVeiculo, numeroLinha } = req.body;

    if (!tipoTransporte || !empresa || !dataHoraPartida || !dataHoraChegada || !valor) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const tripRef = db.collection("trip").doc(tripId);
    const tripSnap = await tripRef.get();

    if (!tripSnap.exists) {
      res.status(404).json({ error: "Viagem não encontrada." });
      return;
    }

    await db.collection("transport").add({
      tripId,
      tipoTransporte,
      empresa,
      dataHoraPartida,
      dataHoraChegada,
      valor,
      observacoes: observacoes || "",
      modeloVeiculo: modeloVeiculo || "",
      placaVeiculo: placaVeiculo || "",
      numeroLinha: numeroLinha || "",
      criadoEm: new Date(),
    });

    res.status(200).json({ message: "Transporte adicionado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao adicionar transporte:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};

export const readTransport: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;

    console.log("Buscando transportes para tripId:", tripId);

    const snapshot = await db
      .collection("transport")
      .where("tripId", "==", tripId)
      .get();

    console.log("Quantidade de transportes encontrados:", snapshot.size);

    const transports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(transports);
  } catch (error: any) {
    console.error("Erro ao buscar transportes:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};

export const updateTransport: RequestHandler = async (req, res) => {
  try {
    const { transportId } = req.params;
    const { tipoTransporte, empresa, dataHoraPartida, dataHoraChegada, valor, observacoes, modeloVeiculo, placaVeiculo, numeroLinha } = req.body;

    if (!tipoTransporte || !empresa || !dataHoraPartida || !dataHoraChegada || !valor) {
      res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
      return;
    }

    const transportRef = db.collection("transport").doc(transportId);
    const transportSnap = await transportRef.get();

    if (!transportSnap.exists) {
      res.status(404).json({ error: "Transporte não encontrado." });
      return;
    }

    await transportRef.update({
      tipoTransporte,
      empresa,
      dataHoraPartida,
      dataHoraChegada,
      valor,
      observacoes: observacoes || "",
      modeloVeiculo: modeloVeiculo || "",
      placaVeiculo: placaVeiculo || "",
      numeroLinha: numeroLinha || "",
      atualizadoEm: new Date(),
    });

    res.status(200).json({ message: "Transporte atualizado com sucesso." });
  } catch (error: any) {
    console.error("Erro ao atualizar transporte:", error);
    res.status(500).json({ error: error.message || "Erro interno ao atualizar transporte." });
  }
};

export const deleteTransport: RequestHandler = async (req, res) => {
  try {
    const { transportId } = req.params;

    const transportRef = db.collection("transport").doc(transportId);
    const transportSnap = await transportRef.get();

    if (!transportSnap.exists) {
      res.status(404).json({ error: "Transporte não encontrado." });
      return;
    }

    await transportRef.delete();

    res.status(200).json({ message: "Transporte excluído com sucesso." });
  } catch (error: any) {
    console.error("Erro ao excluir transporte:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
};
